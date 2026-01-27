import { Router } from 'express';
import teamsService from '../../services/teams.service';
import { authenticateToken, AuthenticatedUser } from '../../middleware/auth.middleware';

const router = Router();

// All routes except invite endpoints require authentication
router.use((req, res, next) => {
  // Don't require auth for getting invite by token
  if (req.path.includes('/invites/') && req.method === 'GET') {
    return next();
  }
  // Reject invite doesn't require auth
  if (req.path.includes('/invites/') && req.method === 'POST' && req.path.includes('/reject')) {
    return next();
  }
  return authenticateToken(req, res, next);
});

// Create a new team
router.post('/', async (req, res) => {
  try {
    const userId = (req.user as AuthenticatedUser)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, description } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    if (name.length > 50) {
      return res.status(400).json({ error: 'Team name must be 50 characters or less' });
    }

    if (description && description.length > 200) {
      return res.status(400).json({ error: 'Description must be 200 characters or less' });
    }

    const team = await teamsService.createTeam(userId, name.trim(), description?.trim());
    res.status(201).json(team);
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// Get all teams for current user
router.get('/', async (req, res) => {
  try {
    const userId = (req.user as AuthenticatedUser)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const teams = await teamsService.getTeamsByUserId(userId);
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Get a specific team by ID
router.get('/:id', async (req, res) => {
  try {
    const userId = (req.user as AuthenticatedUser)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const team = await teamsService.getTeamById(req.params.id, userId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// Get team members
router.get('/:id/members', async (req, res) => {
  try {
    const userId = (req.user as AuthenticatedUser)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const members = await teamsService.getTeamMembers(req.params.id, userId);
    res.json(members);
  } catch (error: any) {
    console.error('Error fetching team members:', error);
    if (error.message === 'User is not a member of this team') {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// Invite team members
router.post('/:id/invites', async (req, res) => {
  try {
    const userId = (req.user as AuthenticatedUser)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { emails, role, personal_message } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: 'Email addresses are required' });
    }

    if (role && !['editor', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emails.filter((email) => !emailRegex.test(email));
    if (invalidEmails.length > 0) {
      return res.status(400).json({ error: 'Invalid email addresses', invalidEmails });
    }

    const invites = await teamsService.inviteTeamMembers(
      req.params.id,
      userId,
      emails,
      role || 'editor',
      personal_message
    );

    res.status(201).json(invites);
  } catch (error: any) {
    console.error('Error inviting team members:', error);
    if (error.message === 'Only team admins can invite members') {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to invite team members' });
  }
});

// Get pending invites for a team
router.get('/:id/invites', async (req, res) => {
  try {
    const userId = (req.user as AuthenticatedUser)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const invites = await teamsService.getPendingInvites(req.params.id, userId);
    res.json(invites);
  } catch (error: any) {
    console.error('Error fetching pending invites:', error);
    if (error.message === 'Only team admins can view pending invites') {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to fetch pending invites' });
  }
});

// Accept an invite
router.post('/invites/:token/accept', async (req, res) => {
  try {
    const userId = (req.user as AuthenticatedUser)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await teamsService.acceptInvite(req.params.token, userId);
    res.json({ message: 'Invite accepted successfully' });
  } catch (error: any) {
    console.error('Error accepting invite:', error);
    if (error.message === 'Invalid or expired invite') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to accept invite' });
  }
});

// Reject an invite
router.post('/invites/:token/reject', async (req, res) => {
  try {
    const success = await teamsService.rejectInvite(req.params.token);
    if (!success) {
      return res.status(404).json({ error: 'Invite not found' });
    }

    res.json({ message: 'Invite rejected successfully' });
  } catch (error) {
    console.error('Error rejecting invite:', error);
    res.status(500).json({ error: 'Failed to reject invite' });
  }
});

// Get invite by token (for invite page)
router.get('/invites/:token', async (req, res) => {
  try {
    const invite = await teamsService.getInviteByToken(req.params.token);
    if (!invite) {
      return res.status(404).json({ error: 'Invite not found or expired' });
    }

    res.json(invite);
  } catch (error) {
    console.error('Error fetching invite:', error);
    res.status(500).json({ error: 'Failed to fetch invite' });
  }
});

// Update member role
router.patch('/:teamId/members/:memberId/role', async (req, res) => {
  try {
    const adminId = (req.user as AuthenticatedUser)?.id;
    if (!adminId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { role } = req.body;

    if (!role || !['admin', 'editor', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const member = await teamsService.updateMemberRole(
      req.params.teamId,
      req.params.memberId,
      adminId,
      role
    );

    res.json(member);
  } catch (error: any) {
    console.error('Error updating member role:', error);
    if (error.message === 'Only team admins can change member roles') {
      return res.status(403).json({ error: error.message });
    }
    if (error.message === 'Member not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update member role' });
  }
});

// Remove member from team
router.delete('/:teamId/members/:memberId', async (req, res) => {
  try {
    const adminId = (req.user as AuthenticatedUser)?.id;
    if (!adminId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await teamsService.removeMember(req.params.teamId, req.params.memberId, adminId);
    res.json({ message: 'Member removed successfully' });
  } catch (error: any) {
    console.error('Error removing member:', error);
    if (error.message === 'Only team admins can remove members') {
      return res.status(403).json({ error: error.message });
    }
    if (error.message === 'Member not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// Delete a team
router.delete('/:id', async (req, res) => {
  try {
    const userId = (req.user as AuthenticatedUser)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const success = await teamsService.deleteTeam(req.params.id, userId);
    if (!success) {
      return res.status(404).json({ error: 'Team not found or unauthorized' });
    }

    res.json({ message: 'Team deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting team:', error);
    if (error.message === 'Only team creator can delete the team') {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

export default router;
