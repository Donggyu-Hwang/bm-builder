export interface PriorityItem {
  id: string;
  title: string;
  description: string;
  order: number;
}

export interface GeneratePrioritiesRequest {
  vision: string;
  targetCustomer: string;
  currentStage: 'idea' | 'prototype' | 'mvp' | 'growth';
}
