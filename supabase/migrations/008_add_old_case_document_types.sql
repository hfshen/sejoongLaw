-- Add OLD-case document types to documents table CHECK constraint
-- This migration adds support for OLD-case document types (agreement_old, power_of_attorney_old, etc.)

-- First, drop the existing CHECK constraint
ALTER TABLE documents 
DROP CONSTRAINT IF EXISTS documents_document_type_check;

-- Add the new CHECK constraint with OLD-case types included
ALTER TABLE documents 
ADD CONSTRAINT documents_document_type_check 
CHECK (document_type IN (
  'agreement',              -- 합의서
  'power_of_attorney',      -- 위임장
  'attorney_appointment',   -- 변호인선임서
  'litigation_power',       -- 소송위임장
  'insurance_consent',      -- 사망보험금지급동의
  'agreement_old',         -- 합의서(OLD-case)
  'power_of_attorney_old',  -- 위임장(OLD-case)
  'attorney_appointment_old', -- 변호인선임서(OLD-case)
  'litigation_power_old',  -- 소송위임장(OLD-case)
  'insurance_consent_old'  -- 사망보험금지급동의(OLD-case)
));
