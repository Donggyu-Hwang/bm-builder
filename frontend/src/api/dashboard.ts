import api from './axios';

export interface UserDashboardStats {
  totalDocuments: number;
  draftDocuments: number;
  completedDocuments: number;
  totalSlides: number;
  teamCount: number;
  recentActivity: Array<{
    action: string;
    entityType: string;
    entityTitle: string;
    createdAt: string;
  }>;
  priorities: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface ProgressSummary {
  totalEpics: number;
  completedEpics: number;
  totalStories: number;
  completedStories: number;
  overallProgress: number;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalTeams: number;
  totalDocuments: number;
  activeUsers: number;
  premiumSubscriptions: number;
}

class DashboardService {
  async getUserDashboardStats(): Promise<UserDashboardStats> {
    const response = await api.get('/dashboard/user');
    return response.data.data;
  }

  async getProjectProgress(): Promise<ProgressSummary> {
    const response = await api.get('/dashboard/progress');
    return response.data.data;
  }

  async getAdminDashboardStats(): Promise<AdminDashboardStats> {
    const response = await api.get('/dashboard/admin');
    return response.data.data;
  }
}

export default new DashboardService();
