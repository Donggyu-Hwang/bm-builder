-- Migration: Create glossary table
-- Description: Table for storing business term definitions for learning support

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create glossary table
CREATE TABLE IF NOT EXISTS public.glossary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT NOT NULL UNIQUE,
  definition TEXT NOT NULL,
  examples TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for search performance
CREATE INDEX IF NOT EXISTS glossary_term_idx ON public.glossary(term);
CREATE INDEX IF NOT EXISTS glossary_category_idx ON public.glossary(category);
CREATE INDEX IF NOT EXISTS glossary_definition_idx ON public.glossary USING gin(to_tsvector('english', definition));

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_glossary_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER glossary_updated_at
  BEFORE UPDATE ON public.glossary
  FOR EACH ROW
  EXECUTE FUNCTION update_glossary_updated_at();

-- Add comment
COMMENT ON TABLE public.glossary IS 'Business terms and definitions for learning support';
COMMENT ON COLUMN public.glossary.term IS 'Business term name (unique)';
COMMENT ON COLUMN public.glossary.definition IS 'Term definition (1-2 sentences)';
COMMENT ON COLUMN public.glossary.examples IS 'Related examples (optional)';
COMMENT ON COLUMN public.glossary.category IS 'Term category (e.g., Startup Methodology, Product Development)';
