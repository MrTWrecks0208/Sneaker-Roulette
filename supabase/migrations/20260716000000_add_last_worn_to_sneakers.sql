-- Add last_worn field to sneakers table
ALTER TABLE sneakers ADD COLUMN IF NOT EXISTS last_worn timestamptz DEFAULT NULL;
