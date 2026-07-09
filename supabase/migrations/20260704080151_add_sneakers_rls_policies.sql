/*
  # Add RLS policies for sneakers table

  This is a personal inventory app without auth, so we allow anon access
  for all operations.
*/

-- Allow anon + authenticated to view sneakers
CREATE POLICY "Anyone can view sneakers"
  ON sneakers FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anon + authenticated to insert sneakers
CREATE POLICY "Anyone can insert sneakers"
  ON sneakers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anon + authenticated to update sneakers
CREATE POLICY "Anyone can update sneakers"
  ON sneakers FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anon + authenticated to delete sneakers
CREATE POLICY "Anyone can delete sneakers"
  ON sneakers FOR DELETE
  TO anon, authenticated
  USING (true);