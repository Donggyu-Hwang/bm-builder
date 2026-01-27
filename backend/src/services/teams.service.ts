import pool from '../utils/db';

export interface Team {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'pending';
  invited_by?: string;
  joined_at: Date;
  created_at: Date;
}

export interface TeamInvite {
  id: string;
  team_id: string;
  email: string;
  role: 'editor' | 'viewer';
  token: string;
  invited_by: string;
  personal_message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface TeamWithMembers extends Team {
  member_count: number;
  members?: Array<TeamMember & { full_name?: string; email?: string }>;
}

class TeamsService {
  async createTeam(userId: string, name: string, description?: string): Promise<Team> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create team
      const teamResult = await client.query(
        `INSERT INTO teams (name, description, created_by)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [name, description, userId]
      );

      const team = teamResult.rows[0];

      // Add creator as admin
      await client.query(
        `INSERT INTO team_members (team_id, user_id, role, status, invited_by)
         VALUES ($1, $2, 'admin', 'active', $3)`,
        [team.id, userId, userId]
      );

      // Log activity
      await client.query(
        `INSERT INTO activity_logs (team_id, user_id, action, entity_type, entity_id, metadata)
         VALUES ($1, $2, 'created', 'team', $3, $4)`,
        [team.id, userId, team.id, JSON.stringify({ team_name: name })]
      );

      await client.query('COMMIT');
      return team;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getTeamsByUserId(userId: string): Promise<TeamWithMembers[]> {
    const result = await pool.query(
      `SELECT t.*, COUNT(tm.id) as member_count
       FROM teams t
       INNER JOIN team_members tm ON t.id = tm.team_id
       WHERE tm.user_id = $1 AND tm.status = 'active'
       GROUP BY t.id
       ORDER BY t.created_at DESC`,
      [userId]
    );

    return result.rows;
  }

  async getTeamById(teamId: string, userId: string): Promise<TeamWithMembers | null> {
    // First check if user is a member
    const memberCheck = await pool.query(
      `SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2 AND status = 'active'`,
      [teamId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return null;
    }

    const teamResult = await pool.query(
      `SELECT t.*, COUNT(tm.id) as member_count
       FROM teams t
       WHERE t.id = $1
       GROUP BY t.id`,
      [teamId]
    );

    if (teamResult.rows.length === 0) {
      return null;
    }

    return teamResult.rows[0];
  }

  async getTeamMembers(teamId: string, userId: string): Promise<TeamMember[]> {
    // Verify user is a member
    const memberCheck = await pool.query(
      `SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2 AND status = 'active'`,
      [teamId, userId]
    );

    if (memberCheck.rows.length === 0) {
      throw new Error('User is not a member of this team');
    }

    const result = await pool.query(
      `SELECT tm.*, p.full_name, p.email
       FROM team_members tm
       LEFT JOIN profiles p ON tm.user_id = p.id
       WHERE tm.team_id = $1
       ORDER BY tm.role, tm.created_at`,
      [teamId]
    );

    return result.rows;
  }

  async inviteTeamMembers(
    teamId: string,
    inviterId: string,
    emails: string[],
    role: 'editor' | 'viewer',
    personalMessage?: string
  ): Promise<TeamInvite[]> {
    // Verify inviter is admin
    const adminCheck = await pool.query(
      `SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2 AND role = 'admin' AND status = 'active'`,
      [teamId, inviterId]
    );

    if (adminCheck.rows.length === 0) {
      throw new Error('Only team admins can invite members');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const invites: TeamInvite[] = [];

      for (const email of emails) {
        // Check if email is already a member
        const existingMember = await client.query(
          `SELECT tm.id
           FROM team_members tm
           INNER JOIN profiles p ON tm.user_id = p.id
           WHERE tm.team_id = $1 AND p.email = $2`,
          [teamId, email]
        );

        if (existingMember.rows.length > 0) {
          continue; // Skip existing members
        }

        // Check if there's already a pending invite
        const existingInvite = await client.query(
          `SELECT id FROM team_invites WHERE team_id = $1 AND email = $2 AND status = 'pending'`,
          [teamId, email]
        );

        if (existingInvite.rows.length > 0) {
          continue; // Skip already invited users
        }

        const result = await client.query(
          `INSERT INTO team_invites (team_id, email, role, invited_by, personal_message)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [teamId, email, role, inviterId, personalMessage]
        );

        invites.push(result.rows[0]);

        // Log activity
        await client.query(
          `INSERT INTO activity_logs (team_id, user_id, action, entity_type, metadata)
           VALUES ($1, $2, 'invited', 'member', $3)`,
          [teamId, inviterId, JSON.stringify({ email, role })]
        );
      }

      await client.query('COMMIT');
      return invites;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getInviteByToken(token: string): Promise<TeamInvite | null> {
    const result = await pool.query(
      `SELECT ti.*, t.name as team_name, t.description as team_description
       FROM team_invites ti
       INNER JOIN teams t ON ti.team_id = t.id
       WHERE ti.token = $1 AND ti.status = 'pending' AND ti.expires_at > NOW()`,
      [token]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async acceptInvite(token: string, userId: string): Promise<boolean> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get invite details
      const inviteResult = await client.query(
        `SELECT * FROM team_invites WHERE token = $1 AND status = 'pending' AND expires_at > NOW()`,
        [token]
      );

      if (inviteResult.rows.length === 0) {
        throw new Error('Invalid or expired invite');
      }

      const invite = inviteResult.rows[0];

      // Add user to team
      await client.query(
        `INSERT INTO team_members (team_id, user_id, role, status, invited_by)
         VALUES ($1, $2, $3, 'active', $4)
         ON CONFLICT (team_id, user_id) DO UPDATE SET status = 'active', role = $3`,
        [invite.team_id, userId, invite.role, invite.invited_by]
      );

      // Update invite status
      await client.query(
        `UPDATE team_invites SET status = 'accepted', updated_at = NOW() WHERE id = $1`,
        [invite.id]
      );

      // Log activity
      await client.query(
        `INSERT INTO activity_logs (team_id, user_id, action, entity_type, metadata)
         VALUES ($1, $2, 'joined', 'member', $3)`,
        [invite.team_id, userId, JSON.stringify({ invite_id: invite.id })]
      );

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async rejectInvite(token: string): Promise<boolean> {
    const result = await pool.query(
      `UPDATE team_invites SET status = 'rejected', updated_at = NOW()
       WHERE token = $1 AND status = 'pending'
       RETURNING *`,
      [token]
    );

    return result.rows.length > 0;
  }

  async updateMemberRole(
    teamId: string,
    memberId: string,
    adminId: string,
    newRole: 'admin' | 'editor' | 'viewer'
  ): Promise<TeamMember> {
    // Verify requester is admin
    const adminCheck = await pool.query(
      `SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2 AND role = 'admin' AND status = 'active'`,
      [teamId, adminId]
    );

    if (adminCheck.rows.length === 0) {
      throw new Error('Only team admins can change member roles');
    }

    const result = await pool.query(
      `UPDATE team_members SET role = $1 WHERE id = $2 AND team_id = $3 RETURNING *`,
      [newRole, memberId, teamId]
    );

    if (result.rows.length === 0) {
      throw new Error('Member not found');
    }

    // Log activity
    await pool.query(
      `INSERT INTO activity_logs (team_id, user_id, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, 'role_changed', 'member', $3, $4)`,
      [teamId, adminId, memberId, JSON.stringify({ new_role: newRole })]
    );

    return result.rows[0];
  }

  async removeMember(teamId: string, memberId: string, adminId: string): Promise<boolean> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Verify requester is admin
      const adminCheck = await pool.query(
        `SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2 AND role = 'admin' AND status = 'active'`,
        [teamId, adminId]
      );

      if (adminCheck.rows.length === 0) {
        throw new Error('Only team admins can remove members');
      }

      // Soft delete by setting status to inactive
      const result = await pool.query(
        `UPDATE team_members SET status = 'inactive' WHERE id = $1 AND team_id = $2 RETURNING *`,
        [memberId, teamId]
      );

      if (result.rows.length === 0) {
        throw new Error('Member not found');
      }

      // Log activity
      await pool.query(
        `INSERT INTO activity_logs (team_id, user_id, action, entity_type, entity_id, metadata)
         VALUES ($1, $2, 'deleted', 'member', $3, $4)`,
        [teamId, adminId, memberId, null]
      );

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getPendingInvites(teamId: string, userId: string): Promise<TeamInvite[]> {
    // Verify user is admin
    const adminCheck = await pool.query(
      `SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2 AND role = 'admin' AND status = 'active'`,
      [teamId, userId]
    );

    if (adminCheck.rows.length === 0) {
      throw new Error('Only team admins can view pending invites');
    }

    const result = await pool.query(
      `SELECT ti.*, p.full_name as inviter_name
       FROM team_invites ti
       LEFT JOIN profiles p ON ti.invited_by = p.id
       WHERE ti.team_id = $1 AND ti.status = 'pending'
       ORDER BY ti.created_at DESC`,
      [teamId]
    );

    return result.rows;
  }

  async deleteTeam(teamId: string, userId: string): Promise<boolean> {
    // Verify user is team creator
    const teamCheck = await pool.query(`SELECT id FROM teams WHERE id = $1 AND created_by = $2`, [
      teamId,
      userId,
    ]);

    if (teamCheck.rows.length === 0) {
      throw new Error('Only team creator can delete the team');
    }

    const result = await pool.query(`DELETE FROM teams WHERE id = $1 RETURNING id`, [teamId]);

    return result.rows.length > 0;
  }
}

export default new TeamsService();
