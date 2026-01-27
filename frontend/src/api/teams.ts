import api from './axios';

export interface Team {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'pending';
  full_name?: string;
  email?: string;
  invited_by?: string;
  joined_at: string;
  created_at: string;
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
  expires_at: string;
  created_at: string;
  updated_at: string;
  inviter_name?: string;
  team_name?: string;
  team_description?: string;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
}

export interface InviteMembersRequest {
  emails: string[];
  role?: 'editor' | 'viewer';
  personal_message?: string;
}

class TeamsService {
  async createTeam(data: CreateTeamRequest): Promise<Team> {
    const response = await api.post<Team>('/teams', data);
    return response.data;
  }

  async getTeams(): Promise<Team[]> {
    const response = await api.get<Team[]>('/teams');
    return response.data;
  }

  async getTeam(teamId: string): Promise<Team> {
    const response = await api.get<Team>(`/teams/${teamId}`);
    return response.data;
  }

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const response = await api.get<TeamMember[]>(`/teams/${teamId}/members`);
    return response.data;
  }

  async inviteMembers(teamId: string, data: InviteMembersRequest): Promise<TeamInvite[]> {
    const response = await api.post<TeamInvite[]>(`/teams/${teamId}/invites`, data);
    return response.data;
  }

  async getPendingInvites(teamId: string): Promise<TeamInvite[]> {
    const response = await api.get<TeamInvite[]>(`/teams/${teamId}/invites`);
    return response.data;
  }

  async acceptInvite(token: string): Promise<void> {
    await api.post(`/teams/invites/${token}/accept`);
  }

  async rejectInvite(token: string): Promise<void> {
    await api.post(`/teams/invites/${token}/reject`);
  }

  async getInviteByToken(token: string): Promise<TeamInvite> {
    const response = await api.get<TeamInvite>(`/teams/invites/${token}`);
    return response.data;
  }

  async updateMemberRole(
    teamId: string,
    memberId: string,
    role: 'admin' | 'editor' | 'viewer'
  ): Promise<TeamMember> {
    const response = await api.patch<TeamMember>(`/teams/${teamId}/members/${memberId}/role`, {
      role,
    });
    return response.data;
  }

  async removeMember(teamId: string, memberId: string): Promise<void> {
    await api.delete(`/teams/${teamId}/members/${memberId}`);
  }

  async deleteTeam(teamId: string): Promise<void> {
    await api.delete(`/teams/${teamId}`);
  }
}

export default new TeamsService();
