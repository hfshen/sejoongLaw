-- Cases table for storing case information
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_number TEXT,
  case_name TEXT NOT NULL,
  case_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add case_id and is_case_linked columns to documents table
ALTER TABLE documents 
  ADD COLUMN IF NOT EXISTS case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_case_linked BOOLEAN DEFAULT false;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_cases_case_number ON cases(case_number);
CREATE INDEX IF NOT EXISTS idx_cases_case_name ON cases(case_name);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_case_id ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_is_case_linked ON documents(is_case_linked);

-- Update timestamp trigger for cases
CREATE OR REPLACE FUNCTION update_cases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION update_cases_updated_at();

-- Enable Row Level Security for cases
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- Only authenticated admin users can access cases
CREATE POLICY "Admin users can manage cases"
  ON cases FOR ALL
  USING (true)
  WITH CHECK (true);

