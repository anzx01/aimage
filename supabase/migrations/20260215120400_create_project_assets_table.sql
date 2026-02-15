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
