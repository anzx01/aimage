-- Create publish_tasks table
-- TikTok video publishing tasks

CREATE TABLE publish_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  tiktok_account_id uuid REFERENCES tiktok_accounts(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'publishing', 'published', 'failed')),
  tiktok_video_id text,
  published_url text,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz
);

-- Create indexes
CREATE INDEX idx_publish_tasks_user_id ON publish_tasks(user_id);
CREATE INDEX idx_publish_tasks_project_id ON publish_tasks(project_id);
CREATE INDEX idx_publish_tasks_status ON publish_tasks(status);

-- Enable RLS
ALTER TABLE publish_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own publish tasks"
  ON publish_tasks FOR SELECT
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_publish_tasks_updated_at
  BEFORE UPDATE ON publish_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
