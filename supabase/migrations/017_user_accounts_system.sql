-- User accounts system for foreign lawyers and other roles
-- Extends profiles table with account status and invitation tracking

-- Add status column to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('active', 'pending', 'suspended')) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS invited_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP WITH TIME ZONE;

-- Create user invitations table
CREATE TABLE IF NOT EXISTS user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('korea_agent', 'translator', 'foreign_lawyer', 'family_viewer', 'admin')),
  country TEXT,
  organization TEXT,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id),
  UNIQUE(email, token)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON user_invitations(token);
CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON user_invitations(email);
CREATE INDEX IF NOT EXISTS idx_user_invitations_user_id ON user_invitations(user_id);

-- Function to automatically create profile when user is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, status, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    'family_viewer', -- Default role
    'pending', -- Default status
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Enable RLS on user_invitations
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_invitations
DROP POLICY IF EXISTS "Admins can view all invitations" ON user_invitations;
CREATE POLICY "Admins can view all invitations"
  ON user_invitations FOR SELECT
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

DROP POLICY IF EXISTS "Admins can create invitations" ON user_invitations;
CREATE POLICY "Admins can create invitations"
  ON user_invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    (
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
    AND invited_by = auth.uid()
  );

DROP POLICY IF EXISTS "Users can view their own invitations" ON user_invitations;
CREATE POLICY "Users can view their own invitations"
  ON user_invitations FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Update profiles RLS policies to include status
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  )
  WITH CHECK (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Policy for admins to update any profile
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );
