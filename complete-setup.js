const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://oogqdhxkznhbkehkfexe.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vZ3FkaHhrem5oYmtlaGtmZXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTEyODg3NiwiZXhwIjoyMDg2NzA0ODc2fQ.JtXVa3T4TVcrSynHnnHWRkNcKt15LI68nAhuhDpQjPc';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQL(sql, description) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function setupStoragePolicies() {
  console.log('\n🔐 步骤 2: 配置存储桶策略...\n');

  const policiesSQL = `
-- avatars 存储桶策略
CREATE POLICY IF NOT EXISTS "Public avatars are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- assets 存储桶策略
CREATE POLICY IF NOT EXISTS "Users can view their own assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Users can upload their own assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Users can update their own assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Users can delete their own assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- videos 存储桶策略
CREATE POLICY IF NOT EXISTS "Public videos are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

CREATE POLICY IF NOT EXISTS "Users can upload their own videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Users can update their own videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Users can delete their own videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- thumbnails 存储桶策略
CREATE POLICY IF NOT EXISTS "Public thumbnails are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'thumbnails');

CREATE POLICY IF NOT EXISTS "Users can upload their own thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Users can update their own thumbnails"
ON storage.objects FOR UPDATE
USING (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Users can delete their own thumbnails"
ON storage.objects FOR DELETE
USING (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);
`;

  const result = await executeSQL(policiesSQL, '存储桶策略');

  if (result.success) {
    console.log('   ✅ 存储桶策略配置成功\n');
  } else {
    console.log('   ⚠️  存储桶策略配置失败\n');
    console.log('   错误信息:', result.error);
  }
}

async function insertShowcaseCases() {
  console.log('\n📝 步骤 3: 插入案例库种子数据...\n');

  const seedSQL = `
INSERT INTO showcase_cases (title, description, category, video_url, thumbnail_url, duration, views, likes) VALUES
('美食探店 - 火锅篇', '展示成都火锅店的热闹氛围和美味佳肴', 'food', 'https://example.com/videos/hotpot.mp4', 'https://example.com/thumbnails/hotpot.jpg', 30, 15234, 892),
('旅行 Vlog - 云南大理', '记录大理古城的美丽风光和人文风情', 'travel', 'https://example.com/videos/dali.mp4', 'https://example.com/thumbnails/dali.jpg', 60, 28456, 1523),
('产品开箱 - 最新款手机', '详细展示新手机的外观设计和核心功能', 'product', 'https://example.com/videos/phone.mp4', 'https://example.com/thumbnails/phone.jpg', 45, 45678, 2341),
('知识分享 - AI 入门指南', '用简单易懂的方式讲解 AI 基础概念', 'education', 'https://example.com/videos/ai-guide.mp4', 'https://example.com/thumbnails/ai-guide.jpg', 90, 67890, 3456),
('生活记录 - 我的一天', '记录普通人的日常生活点滴', 'lifestyle', 'https://example.com/videos/daily.mp4', 'https://example.com/thumbnails/daily.jpg', 30, 12345, 678)
ON CONFLICT DO NOTHING;
`;

  const result = await executeSQL(seedSQL, '案例库种子数据');

  if (result.success) {
    console.log('   ✅ 案例库种子数据插入成功\n');
  } else {
    console.log('   ⚠️  案例库种子数据插入失败\n');
    console.log('   错误信息:', result.error);
  }

  // 验证数据
  const { count, error } = await supabase
    .from('showcase_cases')
    .select('*', { count: 'exact', head: true });

  if (!error) {
    console.log(`   📊 showcase_cases 表现有 ${count} 条记录\n`);
  }
}

async function checkAuthConfig() {
  console.log('\n🔐 步骤 1: 检查认证配置...\n');

  console.log('   ⚠️  认证配置需要在 Supabase Dashboard 手动完成\n');
  console.log('   请访问: https://supabase.com/project/oogqdhxkznhbkehkfexe/auth/providers\n');
  console.log('   配置步骤:');
  console.log('   1. 找到 Email 提供商');
  console.log('   2. 确保勾选: Enable Email provider');
  console.log('   3. 确保勾选: Enable Email Signup');
  console.log('   4. 取消勾选: Confirm email (开发阶段)');
  console.log('   5. 点击 Save\n');
}

async function verifySetup() {
  console.log('\n🔍 验证最终配置...\n');

  // 检查表
  const tables = ['profiles', 'showcase_cases', 'projects'];

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`   ❌ ${table.padEnd(20)} 错误`);
    } else {
      console.log(`   ✅ ${table.padEnd(20)} ${count} 条记录`);
    }
  }

  // 检查存储桶
  const { data: buckets } = await supabase.storage.listBuckets();
  console.log(`\n   📦 存储桶: ${buckets.length} 个`);
  buckets.forEach(b => {
    console.log(`      - ${b.name} (${b.public ? 'Public' : 'Private'})`);
  });

  console.log('\n');
}

async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   AIMAGE 完成最后配置步骤                 ║');
  console.log('╚════════════════════════════════════════════╝');

  try {
    // 步骤 1: 检查认证配置（需要手动）
    await checkAuthConfig();

    // 步骤 2: 配置存储桶策略
    await setupStoragePolicies();

    // 步骤 3: 插入案例库数据
    await insertShowcaseCases();

    // 验证配置
    await verifySetup();

    console.log('╔════════════════════════════════════════════╗');
    console.log('║   ✅ 配置完成！                           ║');
    console.log('╚════════════════════════════════════════════╝\n');

    console.log('🎉 下一步:\n');
    console.log('1. 完成认证配置（如果还没做）');
    console.log('   https://supabase.com/project/oogqdhxkznhbkehkfexe/auth/providers\n');
    console.log('2. 测试应用:');
    console.log('   http://localhost:3000/signup\n');

  } catch (error) {
    console.error('\n❌ 执行出错:', error.message);
  }
}

main();
