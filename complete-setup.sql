-- ============================================
-- AIMAGE 完整数据库配置
-- ============================================
--
-- 使用方法:
-- 1. 访问: https://supabase.com/project/oogqdhxkznhbkehkfexe/sql/new
-- 2. 复制此文件全部内容
-- 3. 粘贴到 SQL Editor
-- 4. 点击 Run 按钮
--
-- 此脚本将:
-- - 创建所有数据库表
-- - 配置 RLS 策略
-- - 创建触发器和函数
-- - 插入种子数据
-- - 配置存储桶策略
--
-- ============================================

-- 清理已存在的对象（如果需要重新开始）
-- 注意：这会删除所有数据！
-- DROP TABLE IF EXISTS activity_logs CASCADE;
-- DROP TABLE IF EXISTS publish_tasks CASCADE;
-- DROP TABLE IF EXISTS tiktok_accounts CASCADE;
-- DROP TABLE IF EXISTS digital_humans CASCADE;
-- DROP TABLE IF EXISTS user_favorites CASCADE;
-- DROP TABLE IF EXISTS showcase_cases CASCADE;
-- DROP TABLE IF EXISTS generation_tasks CASCADE;
-- DROP TABLE IF EXISTS project_assets CASCADE;
-- DROP TABLE IF EXISTS assets CASCADE;
-- DROP TABLE IF EXISTS projects CASCADE;
-- DROP TABLE IF EXISTS credit_transactions CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
-- This table extends Supabase auth.users with additional user information

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  phone text UNIQUE,
  full_name text,
  avatar_url text,
  credits integer DEFAULT 10 CHECK (credits >= 0),
  subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'startup', 'enterprise')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_phone ON profiles(phone);
CREATE INDEX idx_profiles_subscription_tier ON profiles(subscription_tier);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
-- Create credit_transactions table
-- Records all credit balance changes for audit trail

CREATE TABLE credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  balance_after integer NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('earn', 'spend', 'refund', 'purchase', 'gift')),
  description text,
  reference_id uuid,
  reference_type text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX idx_credit_transactions_reference ON credit_transactions(reference_id, reference_type);

-- Enable RLS
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);
-- Create projects table
-- Stores user-created video generation projects

CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  project_type text NOT NULL CHECK (project_type IN ('one_click_basic', 'one_click_advanced', 'digital_human', 'viral_clone', 'reverse_prompt')),
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'failed', 'archived')),
  model_version text,
  video_url text,
  thumbnail_url text,
  duration_seconds integer,
  config jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_project_type ON projects(project_type);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
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
-- Create project_assets table
-- Many-to-many relationship between projects and assets

CREATE TABLE project_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  asset_id uuid REFERENCES assets(id) ON DELETE CASCADE,
  asset_role text CHECK (asset_role IN ('product_image', 'scene_image', 'background', 'audio', 'other')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, asset_id)
);

-- Create indexes
CREATE INDEX idx_project_assets_project_id ON project_assets(project_id);
CREATE INDEX idx_project_assets_asset_id ON project_assets(asset_id);

-- Enable RLS
ALTER TABLE project_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own project assets"
  ON project_assets FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_assets.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can create own project assets"
  ON project_assets FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_assets.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own project assets"
  ON project_assets FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_assets.project_id
    AND projects.user_id = auth.uid()
  ));
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
-- Create activity_logs table
-- Audit trail for important user actions

CREATE TABLE activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Enable RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own activity logs"
  ON activity_logs FOR SELECT
  USING (auth.uid() = user_id);
-- Insert initial showcase cases data
-- Sample cases for the showcase library

INSERT INTO showcase_cases (title, description, category, model_version, thumbnail_url, video_url, tags, is_featured) VALUES
  (
    '金铆钉骷髅耳环 - UGC带货视频',
    '使用Sora2生成的产品展示视频，展示金铆钉骷髅耳环的细节和佩戴效果',
    '美妆个护',
    'Sora2',
    'https://placeholder.com/showcase/earring-thumb.jpg',
    'https://placeholder.com/showcase/earring-video.mp4',
    ARRAY['饰品', '耳环', 'UGC', '带货'],
    true
  ),
  (
    '女式内衣产品展示',
    '使用Veo3.1生成的女式内衣产品视频，突出舒适性和设计感',
    '女式内衣',
    'Veo3.1 Fast',
    'https://placeholder.com/showcase/lingerie-thumb.jpg',
    'https://placeholder.com/showcase/lingerie-video.mp4',
    ARRAY['内衣', '女装', '产品展示'],
    true
  ),
  (
    '家居家纺 - 床品套装',
    '温馨家居场景视频，展示床品套装的质感和搭配效果',
    '家居家纺',
    'Sora2',
    'https://placeholder.com/showcase/bedding-thumb.jpg',
    'https://placeholder.com/showcase/bedding-video.mp4',
    ARRAY['家居', '床品', '生活方式'],
    false
  ),
  (
    '数字人口播 - 护肤品推荐',
    '使用高级数字人生成的护肤品推荐视频，专业且亲切',
    '美妆个护',
    'Veo3',
    'https://placeholder.com/showcase/skincare-thumb.jpg',
    'https://placeholder.com/showcase/skincare-video.mp4',
    ARRAY['护肤', '数字人', '口播'],
    true
  ),
  (
    '运动鞋产品测评',
    '动态展示运动鞋的设计细节和穿着效果',
    '鞋靴箱包',
    'Sora2',
    'https://placeholder.com/showcase/shoes-thumb.jpg',
    'https://placeholder.com/showcase/shoes-video.mp4',
    ARRAY['运动鞋', '测评', '产品展示'],
    false
  );

-- Note: In production, replace placeholder URLs with actual CDN URLs

-- ============================================
-- 存储桶策略配置
-- ============================================

-- 先删除已存在的策略（如果有）
DROP POLICY IF EXISTS "Public avatars are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own assets" ON storage.objects;
DROP POLICY IF EXISTS "Public videos are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Public thumbnails are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own thumbnails" ON storage.objects;

-- avatars 存储桶策略
CREATE POLICY "Public avatars are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- assets 存储桶策略
CREATE POLICY "Users can view their own assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- videos 存储桶策略
CREATE POLICY "Public videos are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

CREATE POLICY "Users can upload their own videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- thumbnails 存储桶策略
CREATE POLICY "Public thumbnails are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'thumbnails');

CREATE POLICY "Users can upload their own thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own thumbnails"
ON storage.objects FOR UPDATE
USING (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own thumbnails"
ON storage.objects FOR DELETE
USING (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);
