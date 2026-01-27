import pool from '../utils/db';

export interface ActivityLog {
  id: string;
  team_id: string;
  user_id: string;
  action:
    | 'created'
    | 'edited'
    | 'commented'
    | 'shared'
    | 'deleted'
    | 'invited'
    | 'joined'
    | 'role_changed';
  entity_type: 'document' | 'comment' | 'team' | 'member';
  entity_id?: string;
  // MEDIUM FIX: Replace 'any' with proper type
  metadata?: Record<string, unknown>;
  created_at: Date;
}

export interface ActivityLogWithUser extends ActivityLog {
  full_name?: string;
  email?: string;
  avatar_url?: string;
}

export interface TeamMetrics {
  total_documents: number;
  active_members: number;
  this_week: {
    documents_created: number;
    comments: number;
  };
  trend: string;
}

export interface TeamActivityStats {
  metrics: TeamMetrics;
  most_active_members: Array<{
    user_id: string;
    full_name?: string;
    email?: string;
    activity_count: number;
  }>;
  most_viewed_documents: Array<{
    document_id: string;
    title: string;
    view_count: number;
  }>;
  health_score: number;
  health_status: 'Excellent' | 'Good' | 'Needs attention';
  recommendations: string[];
}

class ActivityService {
  async logActivity(
    teamId: string,
    userId: string,
    action: ActivityLog['action'],
    entityType: ActivityLog['entity_type'],
    entityId?: string,
    // MEDIUM FIX: Replace 'any' with proper type
    metadata?: Record<string, unknown>
  ): Promise<ActivityLog> {
    const result = await pool.query(
      `INSERT INTO activity_logs (team_id, user_id, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [teamId, userId, action, entityType, entityId, metadata]
    );

    return result.rows[0];
  }

  async getTeamActivityLogs(
    teamId: string,
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      action_type?: string;
      member_id?: string;
      date_range?: '7d' | '30d' | 'custom';
    } = {}
  ): Promise<{ activities: ActivityLogWithUser[]; total: number }> {
    // Verify user is a member of the team
    const memberCheck = await pool.query(
      `SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2 AND status = 'active'`,
      [teamId, userId]
    );

    if (memberCheck.rows.length === 0) {
      throw new Error('User is not a member of this team');
    }

    const { limit = 20, offset = 0, action_type, member_id, date_range = '30d' } = options;

    let query = `
      SELECT
        al.*,
        p.full_name,
        p.email,
        p.avatar_url
      FROM activity_logs al
      LEFT JOIN profiles p ON al.user_id = p.id
      WHERE al.team_id = $1
    `;

    // MEDIUM FIX: Replace 'any[]' with proper type
    const params: (string | number | undefined)[] = [teamId];
    let paramCount = 1;

    // Add filters
    if (action_type) {
      paramCount++;
      query += ` AND al.action = $${paramCount}`;
      params.push(action_type);
    }

    if (member_id) {
      paramCount++;
      query += ` AND al.user_id = $${paramCount}`;
      params.push(member_id);
    }

    // Add date range filter
    const dateRangeMap: Record<string, number> = {
      '7d': 7,
      '30d': 30,
    };
    const days = dateRangeMap[date_range ?? '30d'] || 30;
    paramCount++;
    query += ` AND al.created_at >= NOW() - INTERVAL '${days} days'`;

    // Get total count
    const countQuery = query.replace(/SELECT.*?FROM/, 'SELECT COUNT(*) as total FROM');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total, 10);

    // Add ordering and pagination
    query += ` ORDER BY al.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return {
      activities: result.rows,
      total,
    };
  }

  async getTeamMetrics(teamId: string, userId: string): Promise<TeamMetrics> {
    // Verify user is a member of the team
    const memberCheck = await pool.query(
      `SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2 AND status = 'active'`,
      [teamId, userId]
    );

    if (memberCheck.rows.length === 0) {
      throw new Error('User is not a member of this team');
    }

    // Get total documents
    const docsResult = await pool.query(
      `SELECT COUNT(*) as count FROM documents WHERE team_id = $1`,
      [teamId]
    );
    const total_documents = parseInt(docsResult.rows[0].count, 10);

    // Get active members (last 7 days)
    const activeMembersResult = await pool.query(
      `SELECT COUNT(DISTINCT user_id) as count
       FROM activity_logs
       WHERE team_id = $1 AND created_at >= NOW() - INTERVAL '7 days'`,
      [teamId]
    );
    const active_members = parseInt(activeMembersResult.rows[0].count, 10);

    // Get this week's stats
    const thisWeekResult = await pool.query(
      `SELECT
        COUNT(*) FILTER (WHERE action = 'created' AND entity_type = 'document') as documents_created,
        COUNT(*) FILTER (WHERE action = 'commented') as comments
       FROM activity_logs
       WHERE team_id = $1 AND created_at >= NOW() - INTERVAL '7 days'`,
      [teamId]
    );
    const this_week = {
      documents_created: parseInt(thisWeekResult.rows[0].documents_created, 10),
      comments: parseInt(thisWeekResult.rows[0].comments, 10),
    };

    // Calculate trend (compare with previous week)
    const prevWeekResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM activity_logs
       WHERE team_id = $1
         AND created_at >= NOW() - INTERVAL '14 days'
         AND created_at < NOW() - INTERVAL '7 days'`,
      [teamId]
    );
    const prevWeekCount = parseInt(prevWeekResult.rows[0].count, 10);
    const thisWeekCount = this_week.documents_created + this_week.comments;

    let trend = '→ 0%';
    if (prevWeekCount > 0) {
      const percentChange = Math.round(((thisWeekCount - prevWeekCount) / prevWeekCount) * 100);
      if (percentChange > 0) {
        trend = `↑ ${percentChange}%`;
      } else if (percentChange < 0) {
        trend = `↓ ${Math.abs(percentChange)}%`;
      }
    } else if (thisWeekCount > 0) {
      trend = '↑ +100%';
    }

    return {
      total_documents,
      active_members,
      this_week,
      trend,
    };
  }

  async getTeamActivityStats(teamId: string, userId: string): Promise<TeamActivityStats> {
    const metrics = await this.getTeamMetrics(teamId, userId);

    // Get most active members
    const activeMembersResult = await pool.query(
      `SELECT
        al.user_id,
        p.full_name,
        p.email,
        COUNT(*) as activity_count
       FROM activity_logs al
       LEFT JOIN profiles p ON al.user_id = p.id
       WHERE al.team_id = $1 AND al.created_at >= NOW() - INTERVAL '30 days'
       GROUP BY al.user_id, p.full_name, p.email
       ORDER BY activity_count DESC
       LIMIT 5`,
      [teamId]
    );

    const most_active_members = activeMembersResult.rows.map((row) => ({
      user_id: row.user_id,
      full_name: row.full_name,
      email: row.email,
      activity_count: parseInt(row.activity_count, 10),
    }));

    // Get most viewed documents (simulated by activity count on documents)
    const viewedDocsResult = await pool.query(
      `SELECT
        al.entity_id as document_id,
        d.title,
        COUNT(*) as view_count
       FROM activity_logs al
       INNER JOIN documents d ON al.entity_id = d.id
       WHERE al.team_id = $1 AND al.entity_type = 'document'
       GROUP BY al.entity_id, d.title
       ORDER BY view_count DESC
       LIMIT 5`,
      [teamId]
    );

    const most_viewed_documents = viewedDocsResult.rows.map((row) => ({
      document_id: row.document_id,
      title: row.title,
      view_count: parseInt(row.view_count, 10),
    }));

    // Calculate health score (0-100)
    const activityScore = Math.min(metrics.active_members * 10, 50);
    const documentScore = Math.min(metrics.total_documents * 5, 30);
    const engagementScore = Math.min(
      metrics.this_week.documents_created * 3 + metrics.this_week.comments,
      20
    );
    const health_score = activityScore + documentScore + engagementScore;

    let health_status: 'Excellent' | 'Good' | 'Needs attention' = 'Needs attention';
    if (health_score >= 80) health_status = 'Excellent';
    else if (health_score >= 50) health_status = 'Good';

    // Generate recommendations
    const recommendations: string[] = [];
    if (metrics.active_members < 3) {
      recommendations.push('더 많은 팀원을 초대하여 협업을 활성화하세요.');
    }
    if (metrics.this_week.documents_created === 0) {
      recommendations.push('새로운 문서를 생성하여 팀 활동을 시작하세요.');
    }
    if (metrics.this_week.comments === 0 && metrics.total_documents > 0) {
      recommendations.push('문서에 댓글을 달아 팀원들과 소통하세요.');
    }
    if (health_score >= 90) {
      recommendations.push('훌륭합니다! 현재 협업 활동이 매우 활발합니다.');
    }

    return {
      metrics,
      most_active_members,
      most_viewed_documents,
      health_score,
      health_status,
      recommendations,
    };
  }
}

export default new ActivityService();
