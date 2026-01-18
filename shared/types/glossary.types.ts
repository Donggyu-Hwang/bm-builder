/**
 * Glossary and Tooltip Types
 * Story 1.7: Learning Support - Business Term Tooltips
 */

// Glossary term entity
export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  examples?: string | null;
  category: string;
  created_at: string;
  updated_at: string;
}

// User preferences for UI customization
export interface UserPreferences {
  user_id: string;
  show_tooltips: boolean;
  updated_at: string;
}

// Search params for glossary search
export interface GlossarySearchParams {
  q: string; // Search query
  limit?: number; // Max results (default: 5)
}

// Tooltip position
export interface TooltipPosition {
  x: number;
  y: number;
}

// Tooltip display state
export interface TooltipState {
  visible: boolean;
  position: TooltipPosition;
  term: GlossaryTerm | null;
}
