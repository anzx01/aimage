-- Create showcase_cases table
-- Platform's featured example videos

CREATE TABLE showcase_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL,
  model_version text NOT NULL,
  thumbnail_url text NOT NULL,
  video_url text NOT NULL,
  tags text[] DEFAULT ARRAY[]::text[],
  is_featured boolean DEFAULT false,
  view_count integer DEFAULT 0,
  favorite_count integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_showcase_cases_category ON showcase_cases(category);
CREATE INDEX idx_showcase_cases_model_version ON showcase_cases(model_version);
CREATE INDEX idx_showcase_cases_is_featured ON showcase_cases(is_featured);
CREATE INDEX idx_showcase_cases_created_at ON showcase_cases(created_at DESC);
CREATE INDEX idx_showcase_cases_tags ON showcase_cases USING GIN(tags);

-- Enable RLS
ALTER TABLE showcase_cases ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view showcase cases"
  ON showcase_cases FOR SELECT
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_showcase_cases_updated_at
  BEFORE UPDATE ON showcase_cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
