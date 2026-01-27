-- Migration: Create teams, team_members, team_invites, and activity_logs tables
-- Created: 2025-01-22
-- Description: Support for Epic 7: Team Collaboration

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) <= 50),
  description TEXT CHECK (char_length(description) <= 200),
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending')),
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Create team_invites table
CREATE TABLE IF NOT EXISTS team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('editor', 'viewer')),
  token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  invited_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  personal_message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add team_id to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS shared_link TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS sharing_access TEXT DEFAULT 'team' CHECK (sharing_access IN ('anyone', 'team', 'specific'));
ALTER TABLE documents ADD COLUMN IF NOT EXISTS sharing_permission TEXT DEFAULT 'view' CHECK (sharing_permission IN ('view', 'edit', 'comment'));
ALTER TABLE documents ADD COLUMN IF NOT EXISTS link_password TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS link_expires_at TIMESTAMP WITH TIME ZONE;

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  text_anchor TEXT, -- Selected text that the comment is about
  content TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'edited', 'commented', 'shared', 'deleted', 'invited', 'joined', 'role_changed')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('document', 'comment', 'team', 'member')),
  entity_id UUID,
  metadata JSONB, -- Store additional context like document title, section count, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS teams_created_by_idx ON teams(created_by);
CREATE INDEX IF NOT EXISTS team_members_team_id_idx ON team_members(team_id);
CREATE INDEX IF NOT EXISTS team_members_user_id_idx ON team_members(user_id);
CREATE INDEX IF NOT EXISTS team_members_status_idx ON team_members(status);
CREATE INDEX IF NOT EXISTS team_invites_team_id_idx ON team_invites(team_id);
CREATE INDEX IF NOT EXISTS team_invites_email_idx ON team_invites(email);
CREATE INDEX IF NOT EXISTS team_invites_token_idx ON team_invites(token);
CREATE INDEX IF NOT EXISTS team_invites_status_idx ON team_invites(status);
CREATE INDEX IF NOT EXISTS documents_team_id_idx ON documents(team_id);
CREATE INDEX IF NOT EXISTS documents_shared_link_idx ON documents(shared_link);
CREATE INDEX IF NOT EXISTS comments_document_id_idx ON comments(document_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON comments(user_id);
CREATE INDEX IF NOT EXISTS comments_parent_comment_id_idx ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS comments_is_resolved_idx ON comments(is_resolved);
CREATE INDEX IF NOT EXISTS activity_logs_team_id_idx ON activity_logs(team_id);
CREATE INDEX IF NOT EXISTS activity_logs_user_id_idx ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON activity_logs(created_at DESC);

-- Create trigger to update updated_at timestamp for teams
DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to update updated_at timestamp for team_invites
DROP TRIGGER IF EXISTS update_team_invites_updated_at ON team_invites;
CREATE TRIGGER update_team_invites_updated_at BEFORE UPDATE ON team_invites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to update updated_at timestamp for comments
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to log activity when documents are created/updated
CREATE OR REPLACE FUNCTION log_document_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_logs (team_id, user_id, action, entity_type, entity_id, metadata)
    VALUES (
      NEW.team_id,
      NEW.user_id,
      'created',
      'document',
      NEW.id,
      jsonb_build_object('title', NEW.title, 'template_type', NEW.template_type)
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.updated_at != NEW.updated_at THEN
    INSERT INTO activity_logs (team_id, user_id, action, entity_type, entity_id, metadata)
    VALUES (
      NEW.team_id,
      NEW.user_id,
      'edited',
      'document',
      NEW.id,
      jsonb_build_object('title', NEW.title)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS log_document_activity_trigger ON documents;
CREATE TRIGGER log_document_activity_trigger
  AFTER INSERT OR UPDATE ON documents
  FOR EACH ROW
  WHEN (NEW.team_id IS NOT NULL)
  EXECUTE FUNCTION log_document_activity();
