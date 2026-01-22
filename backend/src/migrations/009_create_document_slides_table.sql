-- Document slides table for pitch decks and presentations
CREATE TABLE IF NOT EXISTS document_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  slide_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  figure_id UUID REFERENCES document_figures(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(document_id, slide_number)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_document_slides_document_id ON document_slides(document_id);
CREATE INDEX IF NOT EXISTS idx_document_slides_figure_id ON document_slides(figure_id);
CREATE INDEX IF NOT EXISTS idx_document_slides_slide_number ON document_slides(slide_number);

-- Add comments for documentation
COMMENT ON TABLE document_slides IS 'Individual slides for pitch decks and presentations';
COMMENT ON COLUMN document_slides.slide_number IS 'Slide order in presentation (1-based)';
COMMENT ON COLUMN document_slides.content IS 'Slide content in markdown format';
COMMENT ON COLUMN document_slides.figure_id IS 'Optional associated chart/figure';
COMMENT ON COLUMN document_slides.notes IS 'Presenter notes for the slide';
