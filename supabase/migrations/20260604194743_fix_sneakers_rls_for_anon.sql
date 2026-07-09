/*
  # Fix RLS policies for sneakers table

  The previous policies restricted INSERT/UPDATE/DELETE to authenticated users only.
  Since this is a personal inventory app without auth, we need to allow anon access
  for all operations.

  1. Security Changes
    - Drop restrictive INSERT/UPDATE/DELETE policies that require authenticated users
    - Add new policies allowing anon users to insert, update, and delete sneakers
    - Keep the existing SELECT policy that already allows anon reads
*/

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Authenticated users can insert sneakers" ON sneakers;
DROP POLICY IF EXISTS "Authenticated users can update sneakers" ON sneakers;
DROP POLICY IF EXISTS "Authenticated users can delete sneakers" ON sneakers;

-- Allow anon + authenticated insert
CREATE POLICY "Anyone can insert sneakers"
  ON sneakers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anon + authenticated update
CREATE POLICY "Anyone can update sneakers"
  ON sneakers FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anon + authenticated delete
CREATE POLICY "Anyone can delete sneakers"
  ON sneakers FOR DELETE
  TO anon, authenticated
  USING (true);
