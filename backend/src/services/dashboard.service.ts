import pool from '../utils/db';

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
    createdAt: Date;
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

class DashboardService {
  async getUserDashboardStats(userId: string): Promise<UserDashboardStats> {
    // Get document counts
    const docsResult = await pool.query(
      `SELECT
        COUNT(*) FILTER (WHERE status = 'draft') as draft_count,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
        COUNT(*) as total_count
       FROM documents
       WHERE user_id = $1`,
      [userId]
    );

    // Get slides count
    const slidesResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM document_slides ds
       INNER JOIN documents d ON ds.document_id = d.id
       WHERE d.user_id = $1`,
      [userId]
    );

    // Get team count
    const teamsResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM team_members
       WHERE user_id = $1 AND status = 'active'`,
      [userId]
    );

    // Get recent activity - use audit_logs if activity_logs doesn't exist
    let activityResult;
    try {
      activityResult = await pool.query(
        `SELECT
          action,
          entity as entity_type,
          CASE
            WHEN entity = 'document' THEN (SELECT title FROM documents WHERE id = al.entity_id LIMIT 1)
            WHEN entity = 'comment' THEN (SELECT content FROM comments WHERE id = al.entity_id LIMIT 1)
            ELSE COALESCE(al.entity_id::text, '')
          END as entity_title,
          created_at
         FROM audit_logs al
         WHERE al.user_id = $1
         ORDER BY created_at DESC
         LIMIT 10`,
        [userId]
      );
    } catch (error: any) {
      // If audit_logs doesn't exist or fails, return empty array
      if (error.code === '42P01' || error.code === '42703') {
        // Table or column doesn't exist
        activityResult = { rows: [] };
      } else {
        throw error;
      }
    }

    // Get priorities count (daily_priorities table)
    // priorities is a JSONB array, need to count items by their priority field
    const prioritiesResult = await pool.query(
      `SELECT
        COALESCE(SUM(
          CASE
            WHEN elem->>'priority' = 'high' THEN 1
            ELSE 0
          END
        ), 0) as high,
        COALESCE(SUM(
          CASE
            WHEN elem->>'priority' = 'medium' THEN 1
            ELSE 0
          END
        ), 0) as medium,
        COALESCE(SUM(
          CASE
            WHEN elem->>'priority' = 'low' THEN 1
            ELSE 0
          END
        ), 0) as low
       FROM daily_priorities,
       jsonb_array_elements(priorities) AS elem
       WHERE user_id = $1 AND created_at >= CURRENT_DATE`,
      [userId]
    );

    return {
      totalDocuments: parseInt(docsResult.rows[0].total_count, 10),
      draftDocuments: parseInt(docsResult.rows[0].draft_count, 10),
      completedDocuments: parseInt(docsResult.rows[0].completed_count, 10),
      totalSlides: parseInt(slidesResult.rows[0].count, 10),
      teamCount: parseInt(teamsResult.rows[0].count, 10),
      recentActivity: activityResult.rows,
      priorities: {
        high: parseInt(prioritiesResult.rows[0].high || '0', 10),
        medium: parseInt(prioritiesResult.rows[0].medium || '0', 10),
        low: parseInt(prioritiesResult.rows[0].low || '0', 10),
      },
    };
  }

  async getProjectProgress(userId: string): Promise<ProgressSummary> {
    // This is a simplified version - in production, you'd track actual epic/story progress
    // For now, we'll calculate based on document status

    const result = await pool.query(
      `SELECT
        COUNT(*) as total_documents,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_documents
       FROM documents
       WHERE user_id = $1`,
      [userId]
    );

    const total = parseInt(result.rows[0].total_documents, 10);
    const completed = parseInt(result.rows[0].completed_documents, 10);

    // Assuming each document is roughly equivalent to a story
    const totalStories = Math.max(total, 1);
    const completedStories = completed;

    // Assuming ~10 epics for the project
    const totalEpics = 10;
    const completedEpics = Math.floor(completedStories / 5); // Rough estimate

    const overallProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      totalEpics,
      completedEpics,
      totalStories,
      completedStories,
      overallProgress,
    };
  }

  async getAdminDashboardStats(): Promise<{
    totalUsers: number;
    totalTeams: number;
    totalDocuments: number;
    activeUsers: number; // Last 7 days
    premiumSubscriptions: number;
  }> {
    // Get total users
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM profiles');

    // Get total teams
    const teamsResult = await pool.query('SELECT COUNT(*) as count FROM teams');

    // Get total documents
    const docsResult = await pool.query('SELECT COUNT(*) as count FROM documents');

    // Get active users (last 7 days)
    let activeUsersResult;
    try {
      activeUsersResult = await pool.query(
        `SELECT COUNT(DISTINCT user_id) as count
         FROM audit_logs
         WHERE created_at >= NOW() - INTERVAL '7 days'`
      );
    } catch (error: any) {
      // If audit_logs doesn't exist, return 0
      if (error.code === '42P01') {
        activeUsersResult = { rows: [{ count: '0' }] };
      } else {
        throw error;
      }
    }

    // For premium subscriptions, we'll use a placeholder (would be integrated with payment system)
    const premiumSubscriptions = 0;

    return {
      totalUsers: parseInt(usersResult.rows[0].count, 10),
      totalTeams: parseInt(teamsResult.rows[0].count, 10),
      totalDocuments: parseInt(docsResult.rows[0].count, 10),
      activeUsers: parseInt(activeUsersResult.rows[0].count, 10),
      premiumSubscriptions,
    };
  }
}

export default new DashboardService();
