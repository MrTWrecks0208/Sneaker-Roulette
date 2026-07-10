-- Add user_id column to sneakers table
ALTER TABLE sneakers ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Drop previous open policies
DROP POLICY IF EXISTS "Anyone can view sneakers" ON sneakers;
DROP POLICY IF EXISTS "Anyone can insert sneakers" ON sneakers;
DROP POLICY IF EXISTS "Anyone can update sneakers" ON sneakers;
DROP POLICY IF EXISTS "Anyone can delete sneakers" ON sneakers;

-- Users can view their own sneakers, or anyone can view sneakers with no user_id (retroactive public sneakers)
CREATE POLICY "Users can view own sneakers"
  ON sneakers FOR SELECT
  TO anon, authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can insert their own sneakers (enforced with their authenticated user id)
CREATE POLICY "Users can insert own sneakers"
  ON sneakers FOR INSERT
  TO anon, authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can update their own sneakers
CREATE POLICY "Users can update own sneakers"
  ON sneakers FOR UPDATE
  TO anon, authenticated
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can delete their own sneakers
CREATE POLICY "Users can delete own sneakers"
  ON sneakers FOR DELETE
  TO anon, authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);
