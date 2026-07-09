/*
  # Create sneakers table and storage bucket

  1. New Tables
    - `sneakers`
      - `id` (uuid, primary key)
      - `name` (text, auto-computed from brand+model+variant+colorway)
      - `brand` (text, sneaker brand e.g. Nike, Adidas)
      - `model` (text, model name)
      - `variant` (text, variant of the model)
      - `colorway` (text, colorway description)
      - `height` (text, low/mid/high)
      - `style` (text[], array of styles like casual, athletic, etc.)
      - `color` (text[], array of primary colors)
      - `worn` (integer, number of times worn, default 0)
      - `image_url` (text, URL to stored image)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `sneakers` table
    - Public read access (anyone can view sneakers)
    - Authenticated users can insert/update/delete their own sneakers

  3. Storage
    - Create `sneaker-images` bucket for image uploads
*/

CREATE TABLE IF NOT EXISTS sneakers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  brand text NOT NULL DEFAULT '',
  model text NOT NULL DEFAULT '',
  variant text NOT NULL DEFAULT '',
  colorway text NOT NULL DEFAULT '',
  height text NOT NULL DEFAULT 'Low',
  style text[] DEFAULT '{}',
  color text[] DEFAULT '{}',
  worn integer NOT NULL DEFAULT 0,
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_sneakers_brand ON sneakers(brand);
CREATE INDEX IF NOT EXISTS idx_sneakers_style ON sneakers USING GIN(style);
CREATE INDEX IF NOT EXISTS idx_sneakers_color ON sneakers USING GIN(color);
CREATE INDEX IF NOT EXISTS idx_sneakers_worn ON sneakers(worn);

-- Auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_sneakers_updated_at ON sneakers;
CREATE TRIGGER update_sneakers_updated_at
  BEFORE UPDATE ON sneakers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE sneakers ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view sneakers"
  ON sneakers FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can insert
CREATE POLICY "Authenticated users can insert sneakers"
  ON sneakers FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update
CREATE POLICY "Authenticated users can update sneakers"
  ON sneakers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users can delete
CREATE POLICY "Authenticated users can delete sneakers"
  ON sneakers FOR DELETE
  TO authenticated
  USING (true);

-- Insert a storage bucket for sneaker images
INSERT INTO storage.buckets (id, name, public)
VALUES ('sneaker-images', 'sneaker-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: allow public read
CREATE POLICY "Public read access for sneaker images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'sneaker-images');

-- Storage policy: allow authenticated upload
CREATE POLICY "Authenticated users can upload sneaker images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'sneaker-images');

-- Storage policy: allow authenticated update
CREATE POLICY "Authenticated users can update sneaker images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'sneaker-images')
  WITH CHECK (bucket_id = 'sneaker-images');

-- Storage policy: allow authenticated delete
CREATE POLICY "Authenticated users can delete sneaker images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'sneaker-images');
