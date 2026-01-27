-- Migration: Add node_ui_tour_completed to profiles table
-- Created: 2025-01-23
-- Description: Support for Epic 6 Story 6.6: Node UI Guide Tour

-- Add node_ui_tour_completed column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS node_ui_tour_completed BOOLEAN DEFAULT FALSE;

-- Add tour_current_step column (for resuming tours)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tour_current_step INTEGER DEFAULT 0;

-- Add comment
COMMENT ON COLUMN profiles.node_ui_tour_completed IS 'Whether user has completed the Node UI guided tour';
COMMENT ON COLUMN profiles.tour_current_step IS 'Current step in tour (for resuming interrupted tours)';
