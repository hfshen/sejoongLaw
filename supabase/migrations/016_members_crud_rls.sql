-- RLS policies for members table CRUD operations
-- Only admins can create, update, and delete members
-- Public can view members (for website display)

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view members" ON members;
DROP POLICY IF EXISTS "Admins can create members" ON members;
DROP POLICY IF EXISTS "Admins can update members" ON members;
DROP POLICY IF EXISTS "Admins can delete members" ON members;

-- Public read policy (for website display)
CREATE POLICY "Anyone can view members"
  ON members FOR SELECT
  USING (true);

-- Admin-only create policy
CREATE POLICY "Admins can create members"
  ON members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Admin-only update policy
CREATE POLICY "Admins can update members"
  ON members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Admin-only delete policy
CREATE POLICY "Admins can delete members"
  ON members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );
