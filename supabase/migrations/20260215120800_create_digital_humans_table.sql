-- Create digital_humans table
-- User-created digital human avatars

CREATE TABLE digital_humans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  avatar_url text,
  digital_human_type text NOT NULL CHECK (digital_human_type IN ('advanced', 'sora2')),
  voice_config jsonb DEFAULT '{}'::jsonb,
  appearance_config jsonb DEFAULT '{}'::jsonb,
  is_public boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_digital_humans_user_id ON digital_humans(user_id);
CREATE INDEX idx_digital_humans_type ON digital_humans(digital_human_type);
CREATE INDEX idx_digital_humans_is_public ON digital_humans(is_public);

-- Enable RLS
ALTER TABLE digital_humans ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own digital humans"
  ON digital_humans FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create own digital humans"
  ON digital_humans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own digital humans"
  ON digital_humans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own digital humans"
  ON digital_humans FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_digital_humans_updated_at
  BEFORE UPDATE ON digital_humans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
