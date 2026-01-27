-- Migration: Add UNIQUE constraint to daily_priorities.user_id
-- Description: Enables ON CONFLICT clauses for upsert operations
-- Created: 2025-01-26

-- First, drop any existing non-unique index on user_id
DROP INDEX IF EXISTS daily_priorities_user_id_idx;

-- Add UNIQUE constraint on user_id
-- This may fail if duplicate user_ids exist, so we need to handle duplicates first
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  -- Check for duplicates
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT user_id, COUNT(*) as cnt
    FROM daily_priorities
    GROUP BY user_id
    HAVING COUNT(*) > 1
  ) duplicates;

  IF duplicate_count > 0 THEN
    RAISE NOTICE 'Found % duplicate user_id entries. Keeping only the newest entry for each user.', duplicate_count;

    -- Delete duplicates, keeping only the newest entry for each user
    DELETE FROM daily_priorities d1
    WHERE EXISTS (
      SELECT 1
      FROM daily_priorities d2
      WHERE d2.user_id = d1.user_id
        AND d2.created_at > d1.created_at
    );
  END IF;
END $$;

-- Add the UNIQUE constraint
ALTER TABLE daily_priorities
ADD CONSTRAINT daily_priorities_user_id_key UNIQUE (user_id);

-- Create index will be automatically created by the UNIQUE constraint
COMMENT ON CONSTRAINT daily_priorities_user_id_key ON daily_priorities IS 'Ensures one priority entry per user';
