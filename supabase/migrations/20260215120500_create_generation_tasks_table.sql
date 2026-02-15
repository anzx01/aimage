-- Create generation_tasks table
-- Tracks async video generation tasks

CREATE TABLE generation_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  model_version text NOT NULL,
  credits_cost integer NOT NULL,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_generation_tasks_project_id ON generation_tasks(project_id);
CREATE INDEX idx_generation_tasks_user_id ON generation_tasks(user_id);
CREATE INDEX idx_generation_tasks_status ON generation_tasks(status);
CREATE INDEX idx_generation_tasks_created_at ON generation_tasks(created_at DESC);

-- Enable RLS
ALTER TABLE generation_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own tasks"
  ON generation_tasks FOR SELECT
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_generation_tasks_updated_at
  BEFORE UPDATE ON generation_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to deduct credits when task is created
CREATE OR REPLACE FUNCTION deduct_credits_on_task_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- Deduct credits
  UPDATE profiles
  SET credits = credits - NEW.credits_cost
  WHERE id = NEW.user_id;

  -- Record transaction
  INSERT INTO credit_transactions (user_id, amount, balance_after, transaction_type, description, reference_id, reference_type)
  SELECT
    NEW.user_id,
    -NEW.credits_cost,
    credits,
    'spend',
    'Video generation task',
    NEW.id,
    'generation_task'
  FROM profiles
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to deduct credits on task creation
CREATE TRIGGER deduct_credits_on_generation_task
  AFTER INSERT ON generation_tasks
  FOR EACH ROW
  EXECUTE FUNCTION deduct_credits_on_task_creation();
