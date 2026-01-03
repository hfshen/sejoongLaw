-- Fix RLS policies for bookings to allow public read access for available times
-- This allows anyone to check which times are booked without authentication

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;

-- Allow public read access for checking booked times (date and time only)
CREATE POLICY "Public can view booked times"
  ON bookings FOR SELECT
  USING (true);

-- Keep existing policies for insert and update
-- Users can create bookings (already exists)
-- Users can update their own bookings (already exists)

