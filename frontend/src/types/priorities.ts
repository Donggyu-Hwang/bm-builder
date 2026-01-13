export interface PrioritiesState {
  items: Priority[];
  loading: boolean;
  generating: boolean;
  error: string | null;
  streamingResponse: string;
}

export interface Priority {
  id: string;
  user_id: string;
  priorities: PriorityItem[];
  source: 'ai_suggestion' | 'manual';
  created_at: string;
}

export interface PriorityItem {
  id: string;
  title: string;
  description: string;
  order: number;
}

export type PrioritySource = 'ai_suggestion' | 'manual';
