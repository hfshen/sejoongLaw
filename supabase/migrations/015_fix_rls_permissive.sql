-- Make RLS policies more permissive for development
-- This allows authenticated users to create documents and cases

-- Update get_user_role function to always return a valid role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  -- If user doesn't have a profile, return 'family_viewer' as default
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
    RETURN 'family_viewer';
  END IF;
  
  -- Return user's role or default to 'family_viewer'
  RETURN COALESCE(
    (SELECT role FROM profiles WHERE id = user_id),
    'family_viewer'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate documents INSERT policy - very permissive
DROP POLICY IF EXISTS "Korea agents and admins can create documents" ON documents;
CREATE POLICY "Korea agents and admins can create documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Allow all authenticated users

-- Drop and recreate cases INSERT policy - very permissive
DROP POLICY IF EXISTS "Korea agents and admins can create cases" ON cases;
CREATE POLICY "Korea agents and admins can create cases"
  ON cases FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Allow all authenticated users

-- Drop and recreate document_versions INSERT policy - very permissive
DROP POLICY IF EXISTS "Korea agents and admins can create document versions" ON document_versions;
CREATE POLICY "Korea agents and admins can create document versions"
  ON document_versions FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Allow all authenticated users

-- Update documents SELECT policy to be more permissive
DROP POLICY IF EXISTS "Users can view documents they have access to" ON documents;
CREATE POLICY "Users can view documents they have access to"
  ON documents FOR SELECT
  TO authenticated
  USING (true); -- Allow all authenticated users to view

-- Update cases SELECT policy to be more permissive
DROP POLICY IF EXISTS "Users can view cases they have access to" ON cases;
CREATE POLICY "Users can view cases they have access to"
  ON cases FOR SELECT
  TO authenticated
  USING (true); -- Allow all authenticated users to view

-- Update documents UPDATE policy
DROP POLICY IF EXISTS "Document creators and admins can update documents" ON documents;
CREATE POLICY "Document creators and admins can update documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (true) -- Allow all authenticated users
  WITH CHECK (true);

-- Update cases UPDATE policy
DROP POLICY IF EXISTS "Case creators and admins can update cases" ON cases;
CREATE POLICY "Case creators and admins can update cases"
  ON cases FOR UPDATE
  TO authenticated
  USING (true) -- Allow all authenticated users
  WITH CHECK (true);
