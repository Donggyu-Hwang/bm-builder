-- Document figures table for storing charts and infographics
CREATE TABLE IF NOT EXISTS document_figures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  figure_type TEXT NOT NULL CHECK (figure_type IN ('bar', 'line', 'pie', 'flow')),
  image_url TEXT,
  caption TEXT,
  data_json JSONB DEFAULT '{}',
  "order" INTEGER NOT NULL,
  placeholder_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_document_figures_document_id ON document_figures(document_id);
CREATE INDEX IF NOT EXISTS idx_document_figures_figure_type ON document_figures(figure_type);
CREATE INDEX IF NOT EXISTS idx_document_figures_order ON document_figures("order");

-- Add comments for documentation
COMMENT ON TABLE document_figures IS 'Charts and infographics associated with generated documents';
COMMENT ON COLUMN document_figures.figure_type IS 'Type of figure: bar, line, pie, or flow chart';
COMMENT ON COLUMN document_figures.image_url IS 'URL to generated image (for future image generation)';
COMMENT ON COLUMN document_figures.data_json IS 'Chart data for rendering (e.g., labels, values)';
COMMENT ON COLUMN document_figures.placeholder_text IS 'Text placeholder for MVP phase before image generation';
