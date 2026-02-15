-- Create assets table
-- Stores user-uploaded images, videos, and audio files

CREATE TABLE assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL CHECK (file_type IN ('image', 'video', 'audio')),
  file_size bigint NOT NULL,
  mime_type text,
  width integer,
  height integer,
  duration_seconds integer,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_assets_file_type ON assets(file_type);
CREATE INDEX idx_assets_created_at ON assets(created_at DESC);

-- Enable RLS
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own assets"
  ON assets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own assets"
  ON assets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets"
  ON assets FOR DELETE
  USING (auth.uid() = user_id);
