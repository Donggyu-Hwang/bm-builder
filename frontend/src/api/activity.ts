import api from './axios';

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
  metadata?: any;
  created_at: string;
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
  async getTeamActivityLogs(
    teamId: string,
    options?: {
      limit?: number;
      offset?: number;
      action_type?: string;
      member_id?: string;
      date_range?: '7d' | '30d' | 'custom';
    }
  ): Promise<{ activities: ActivityLogWithUser[]; total: number }> {
    const params = options || {};
    const response = await api.get(`/activity/team/${teamId}`, { params });
    return {
      activities: response.data.data,
      total: response.data.pagination.total,
    };
  }

  async getTeamMetrics(teamId: string): Promise<TeamMetrics> {
    const response = await api.get(`/activity/team/${teamId}/metrics`);
    return response.data.data;
  }

  async getTeamActivityStats(teamId: string): Promise<TeamActivityStats> {
    const response = await api.get(`/activity/team/${teamId}/stats`);
    return response.data.data;
  }
}

export default new ActivityService();
