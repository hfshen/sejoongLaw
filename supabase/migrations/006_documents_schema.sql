-- Documents table for storing legal documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_type TEXT NOT NULL CHECK (document_type IN (
    'agreement',           -- 합의서
    'power_of_attorney',   -- 위임장
    'attorney_appointment', -- 변호인선임서
    'litigation_power',    -- 소송위임장
    'insurance_consent'    -- 사망보험금지급동의
  )),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  locale TEXT NOT NULL DEFAULT 'ko' CHECK (locale IN ('ko', 'en', 'zh-CN')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_name ON documents(name);
CREATE INDEX IF NOT EXISTS idx_documents_date ON documents(date DESC);
CREATE INDEX IF NOT EXISTS idx_documents_locale ON documents(locale);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_documents_type_date ON documents(document_type, date DESC);
CREATE INDEX IF NOT EXISTS idx_documents_name_date ON documents(name, date DESC);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_documents_updated_at();

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Only authenticated admin users can access documents
-- For now, we'll allow all authenticated users (can be restricted later)
CREATE POLICY "Admin users can manage documents"
  ON documents FOR ALL
  USING (true)
  WITH CHECK (true);

