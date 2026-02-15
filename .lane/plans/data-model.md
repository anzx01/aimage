# 数据模型设计文档
# NeoBund1.com - Database Schema

**版本**: 1.0
**日期**: 2026-02-15
**数据库**: PostgreSQL (Supabase)
**ORM**: Supabase Client (TypeScript) + SQLAlchemy (Python)

---

## 目录

1. [数据库概述](#1-数据库概述)
2. [核心表结构](#2-核心表结构)
3. [Row Level Security (RLS)](#3-row-level-security-rls)
4. [索引策略](#4-索引策略)
5. [触发器和函数](#5-触发器和函数)
6. [数据迁移策略](#6-数据迁移策略)

---

## 1. 数据库概述

### 1.1 设计原则

- **规范化**: 遵循第三范式（3NF），减少数据冗余
- **安全性**: 使用 Row Level Security (RLS) 保护用户数据
- **性能**: 合理使用索引，优化查询性能
- **可扩展性**: 预留扩展字段（metadata jsonb）
- **审计**: 记录创建时间、更新时间、操作日志

### 1.2 命名规范

- **表名**: 小写复数形式，下划线分隔（如 `user_profiles`, `generation_tasks`）
- **字段名**: 小写，下划线分隔（如 `created_at`, `full_name`）
- **主键**: 统一使用 `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`
- **外键**: 使用 `<table>_id` 格式（如 `user_id`, `project_id`）
- **时间戳**: 统一使用 `created_at`, `updated_at`

---

## 2. 核心表结构

### 2.1 用户系统

#### 2.1.1 profiles (用户资料表)

**说明**: 存储用户基本信息和积分余额

```sql
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

-- 索引
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_phone ON profiles(phone);
CREATE INDEX idx_profiles_subscription_tier ON profiles(subscription_tier);

-- RLS 策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### 2.1.2 credit_transactions (积分交易记录表)

**说明**: 记录所有积分变动历史

```sql
CREATE TABLE credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  balance_after integer NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('earn', 'spend', 'refund', 'purchase', 'gift')),
  description text,
  reference_id uuid, -- 关联的项目/任务 ID
  reference_type text, -- 'project', 'task', 'purchase' 等
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 索引
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX idx_credit_transactions_reference ON credit_transactions(reference_id, reference_type);

-- RLS 策略
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);
```

### 2.2 项目与内容生成

#### 2.2.1 projects (项目表)

**说明**: 存储用户创建的所有项目

```sql
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  project_type text NOT NULL CHECK (project_type IN ('one_click_basic', 'one_click_advanced', 'digital_human', 'viral_clone', 'reverse_prompt')),
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'failed', 'archived')),
  model_version text, -- 'Sora2', 'Veo3.1 Fast', 'Veo3*4' 等
  video_url text,
  thumbnail_url text,
  duration_seconds integer,
  config jsonb DEFAULT '{}'::jsonb, -- 项目配置参数
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- 索引
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_project_type ON projects(project_type);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- RLS 策略
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

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
```

#### 2.2.2 assets (素材表)

**说明**: 存储用户上传的图片、视频等素材

```sql
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

-- 索引
CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_assets_file_type ON assets(file_type);
CREATE INDEX idx_assets_created_at ON assets(created_at DESC);

-- RLS 策略
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assets"
  ON assets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own assets"
  ON assets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets"
  ON assets FOR DELETE
  USING (auth.uid() = user_id);
```

#### 2.2.3 project_assets (项目素材关联表)

**说明**: 多对多关系，关联项目和素材

```sql
CREATE TABLE project_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  asset_id uuid REFERENCES assets(id) ON DELETE CASCADE,
  asset_role text CHECK (asset_role IN ('product_image', 'scene_image', 'background', 'audio', 'other')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, asset_id)
);

-- 索引
CREATE INDEX idx_project_assets_project_id ON project_assets(project_id);
CREATE INDEX idx_project_assets_asset_id ON project_assets(asset_id);

-- RLS 策略
ALTER TABLE project_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own project assets"
  ON project_assets FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_assets.project_id
    AND projects.user_id = auth.uid()
  ));
```

#### 2.2.4 generation_tasks (生成任务表)

**说明**: 异步任务队列，记录视频生成任务

```sql
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

-- 索引
CREATE INDEX idx_generation_tasks_project_id ON generation_tasks(project_id);
CREATE INDEX idx_generation_tasks_user_id ON generation_tasks(user_id);
CREATE INDEX idx_generation_tasks_status ON generation_tasks(status);
CREATE INDEX idx_generation_tasks_created_at ON generation_tasks(created_at DESC);

-- RLS 策略
ALTER TABLE generation_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks"
  ON generation_tasks FOR SELECT
  USING (auth.uid() = user_id);
```

### 2.3 案例库系统

#### 2.3.1 showcase_cases (优秀案例表)

**说明**: 平台展示的优秀案例

```sql
CREATE TABLE showcase_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL, -- '美妆个护', '女式内衣', '家居家纺' 等
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

-- 索引
CREATE INDEX idx_showcase_cases_category ON showcase_cases(category);
CREATE INDEX idx_showcase_cases_model_version ON showcase_cases(model_version);
CREATE INDEX idx_showcase_cases_is_featured ON showcase_cases(is_featured);
CREATE INDEX idx_showcase_cases_created_at ON showcase_cases(created_at DESC);
CREATE INDEX idx_showcase_cases_tags ON showcase_cases USING GIN(tags);

-- RLS 策略
ALTER TABLE showcase_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view showcase cases"
  ON showcase_cases FOR SELECT
  USING (true);
```

#### 2.3.2 user_favorites (用户收藏表)

**说明**: 用户收藏的案例

```sql
CREATE TABLE user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  case_id uuid REFERENCES showcase_cases(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, case_id)
);

-- 索引
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_case_id ON user_favorites(case_id);

-- RLS 策略
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON user_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON user_favorites FOR DELETE
  USING (auth.uid() = user_id);
```

### 2.4 数字人系统

#### 2.4.1 digital_humans (数字人表)

**说明**: 用户创建的数字人

```sql
CREATE TABLE digital_humans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  avatar_url text,
  digital_human_type text NOT NULL CHECK (digital_human_type IN ('advanced', 'sora2')),
  voice_config jsonb DEFAULT '{}'::jsonb, -- 语音配置（声音、语速、音调等）
  appearance_config jsonb DEFAULT '{}'::jsonb, -- 外观配置
  is_public boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 索引
CREATE INDEX idx_digital_humans_user_id ON digital_humans(user_id);
CREATE INDEX idx_digital_humans_type ON digital_humans(digital_human_type);
CREATE INDEX idx_digital_humans_is_public ON digital_humans(is_public);

-- RLS 策略
ALTER TABLE digital_humans ENABLE ROW LEVEL SECURITY;

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
```

### 2.5 TikTok 集成

#### 2.5.1 tiktok_accounts (TikTok 账号表)

**说明**: 用户连接的 TikTok 账号

```sql
CREATE TABLE tiktok_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  tiktok_user_id text NOT NULL,
  username text NOT NULL,
  display_name text,
  avatar_url text,
  access_token text NOT NULL, -- 加密存储
  refresh_token text, -- 加密存储
  token_expires_at timestamptz,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, tiktok_user_id)
);

-- 索引
CREATE INDEX idx_tiktok_accounts_user_id ON tiktok_accounts(user_id);
CREATE INDEX idx_tiktok_accounts_is_active ON tiktok_accounts(is_active);

-- RLS 策略
ALTER TABLE tiktok_accounts ENABLE ROW LEVEL SECURITY;

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
```

#### 2.5.2 publish_tasks (发布任务表)

**说明**: TikTok 视频发布任务

```sql
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

-- 索引
CREATE INDEX idx_publish_tasks_user_id ON publish_tasks(user_id);
CREATE INDEX idx_publish_tasks_project_id ON publish_tasks(project_id);
CREATE INDEX idx_publish_tasks_status ON publish_tasks(status);

-- RLS 策略
ALTER TABLE publish_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own publish tasks"
  ON publish_tasks FOR SELECT
  USING (auth.uid() = user_id);
```

### 2.6 审计日志

#### 2.6.1 activity_logs (活动日志表)

**说明**: 记录用户重要操作

```sql
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

-- 索引
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- RLS 策略
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity logs"
  ON activity_logs FOR SELECT
  USING (auth.uid() = user_id);
```

---

## 3. Row Level Security (RLS)

### 3.1 RLS 策略总结

所有用户数据表均启用 RLS，确保：
- 用户只能访问自己的数据
- 公共数据（如案例库）对所有人可见
- 管理员可通过 service_role 绕过 RLS

### 3.2 RLS 最佳实践

1. **始终启用 RLS**: `ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;`
2. **明确策略**: 为每个操作（SELECT, INSERT, UPDATE, DELETE）定义策略
3. **使用 auth.uid()**: 获取当前登录用户 ID
4. **性能优化**: 在 RLS 策略中使用的字段添加索引

---

## 4. 索引策略

### 4.1 索引类型

- **B-Tree 索引**: 默认类型，适用于大多数查询
- **GIN 索引**: 用于 JSONB 和数组字段（如 tags）
- **部分索引**: 用于特定条件的查询（如 `WHERE is_active = true`）

### 4.2 索引命名规范

- 单列索引：`idx_<table>_<column>`
- 多列索引：`idx_<table>_<column1>_<column2>`
- 唯一索引：`uniq_<table>_<column>`

---

## 5. 触发器和函数

### 5.1 自动更新 updated_at

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为所有需要的表创建触发器
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ... 其他表类似
```

### 5.2 积分扣除触发器

```sql
CREATE OR REPLACE FUNCTION deduct_credits_on_task_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- 扣除积分
  UPDATE profiles
  SET credits = credits - NEW.credits_cost
  WHERE id = NEW.user_id;

  -- 记录交易
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

CREATE TRIGGER deduct_credits_on_generation_task
  AFTER INSERT ON generation_tasks
  FOR EACH ROW
  EXECUTE FUNCTION deduct_credits_on_task_creation();
```

### 5.3 案例收藏计数器

```sql
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

CREATE TRIGGER update_showcase_favorite_count
  AFTER INSERT OR DELETE ON user_favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_favorite_count();
```

---

## 6. 数据迁移策略

### 6.1 迁移文件命名

格式：`YYYYMMDDHHMMSS_<description>.sql`

示例：
- `20260215120000_create_profiles_table.sql`
- `20260215120100_create_projects_table.sql`
- `20260215120200_add_rls_policies.sql`

### 6.2 迁移顺序

1. 创建基础表（profiles, credit_transactions）
2. 创建业务表（projects, assets, generation_tasks）
3. 创建关联表（project_assets, user_favorites）
4. 创建索引
5. 启用 RLS 并创建策略
6. 创建触发器和函数
7. 插入初始数据（showcase_cases）

### 6.3 回滚策略

每个迁移文件应包含：
- `-- Up Migration`: 正向迁移 SQL
- `-- Down Migration`: 回滚 SQL

---

**文档版本**: 1.0
**最后更新**: 2026-02-15
**状态**: Phase 2 完成
