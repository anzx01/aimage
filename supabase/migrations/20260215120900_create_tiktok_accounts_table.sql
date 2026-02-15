-- Create tiktok_accounts table
-- User's connected TikTok accounts

CREATE TABLE tiktok_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  tiktok_user_id text NOT NULL,
  username text NOT NULL,
  display_name text,
  avatar_url text,
  access_token text NOT NULL,
  refresh_token text,
  token_expires_at timestamptz,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, tiktok_user_id)
);

-- Create indexes
CREATE INDEX idx_tiktok_accounts_user_id ON tiktok_accounts(user_id);
CREATE INDEX idx_tiktok_accounts_is_active ON tiktok_accounts(is_active);

-- Enable RLS
ALTER TABLE tiktok_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own tiktok accounts"
  ON tiktok_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tiktok accounts"
  ON tiktok_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tiktok accounts"
  ON tiktok_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tiktok accounts"
  ON tiktok_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_tiktok_accounts_updated_at
  BEFORE UPDATE ON tiktok_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
