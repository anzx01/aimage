-- Create user_favorites table
-- User's favorited showcase cases

CREATE TABLE user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  case_id uuid REFERENCES showcase_cases(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, case_id)
);

-- Create indexes
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_case_id ON user_favorites(case_id);

-- Enable RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own favorites"
  ON user_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update favorite count
CREATE OR REPLACE FUNCTION update_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE showcase_cases
    SET favorite_count = favorite_count + 1
    WHERE id = NEW.case_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE showcase_cases
    SET favorite_count = favorite_count - 1
    WHERE id = OLD.case_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update favorite count
CREATE TRIGGER update_showcase_favorite_count
  AFTER INSERT OR DELETE ON user_favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_favorite_count();
