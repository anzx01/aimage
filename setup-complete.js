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

async function executeSQLDirect(sql) {
  try {
    // 使用 Supabase 的 REST API 直接执行 SQL
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

async function createStorageBucket(name, isPublic) {
  try {
    const { data, error } = await supabase.storage.createBucket(name, {
      public: isPublic,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: null
    });

    if (error) {
      if (error.message.includes('already exists')) {
        return { success: true, exists: true };
      }
      return { success: false, error: error.message };
    }

    return { success: true, exists: false };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function verifyTables() {
  const tables = [
    'profiles',
    'credit_transactions',
    'projects',
    'assets',
    'project_assets',
    'generation_tasks',
    'showcase_cases',
    'user_favorites',
    'digital_humans',
    'tiktok_accounts',
    'publish_tasks',
    'activity_logs'
  ];

  console.log('\n🔍 验证表创建...\n');

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`   ❌ ${table.padEnd(25)} 不存在`);
      } else {
        console.log(`   ✅ ${table.padEnd(25)} 已创建 (${count || 0} 条记录)`);
      }
    } catch (err) {
      console.log(`   ❌ ${table.padEnd(25)} 错误: ${err.message}`);
    }
  }
}

async function setupStorage() {
  console.log('\n📦 配置存储桶...\n');

  const buckets = [
    { name: 'avatars', public: true },
    { name: 'assets', public: false },
    { name: 'videos', public: true },
    { name: 'thumbnails', public: true }
  ];

  for (const bucket of buckets) {
    const result = await createStorageBucket(bucket.name, bucket.public);

    if (result.success) {
      if (result.exists) {
        console.log(`   ✅ ${bucket.name.padEnd(15)} 已存在 (${bucket.public ? 'Public' : 'Private'})`);
      } else {
        console.log(`   ✅ ${bucket.name.padEnd(15)} 创建成功 (${bucket.public ? 'Public' : 'Private'})`);
      }
    } else {
      console.log(`   ❌ ${bucket.name.padEnd(15)} 失败: ${result.error}`);
    }
  }
}

async function setupStoragePolicies() {
  console.log('\n🔐 配置存储桶策略...\n');

  const policiesSQL = `
-- avatars 存储桶策略
CREATE POLICY IF NOT EXISTS "Public avatars are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- assets 存储桶策略
CREATE POLICY IF NOT EXISTS "Users can view their own assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Users can upload their own assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- videos 存储桶策略
CREATE POLICY IF NOT EXISTS "Public videos are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

CREATE POLICY IF NOT EXISTS "Users can upload their own videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- thumbnails 存储桶策略
CREATE POLICY IF NOT EXISTS "Public thumbnails are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'thumbnails');

CREATE POLICY IF NOT EXISTS "Users can upload their own thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);
`;

  const result = await executeSQLDirect(policiesSQL);

  if (result.success) {
    console.log('   ✅ 存储桶策略配置成功');
  } else {
    console.log('   ⚠️  存储桶策略配置失败，请手动配置');
  }
}

async function runMigrations() {
  console.log('\n🚀 开始执行数据库迁移...\n');

  // 读取完整迁移文件
  const migrationPath = path.join(__dirname, 'supabase', 'complete_migration.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log(`📄 读取迁移文件: ${(sql.length / 1024).toFixed(2)} KB`);
  console.log('⏳ 执行 SQL...\n');

  // 分批执行迁移文件
  const files = [
    '20260215120000_create_profiles_table.sql',
    '20260215120100_create_credit_transactions_table.sql',
    '20260215120200_create_projects_table.sql',
    '20260215120300_create_assets_table.sql',
    '20260215120400_create_project_assets_table.sql',
    '20260215120500_create_generation_tasks_table.sql',
    '20260215120600_create_showcase_cases_table.sql',
    '20260215120700_create_user_favorites_table.sql',
    '20260215120800_create_digital_humans_table.sql',
    '20260215120900_create_tiktok_accounts_table.sql',
    '20260215121000_create_publish_tasks_table.sql',
    '20260215121100_create_activity_logs_table.sql',
    '20260215121200_seed_showcase_cases.sql',
  ];

  for (const file of files) {
    const filePath = path.join(__dirname, 'supabase', 'migrations', file);
    const fileSql = fs.readFileSync(filePath, 'utf8');

    process.stdout.write(`   📝 ${file.padEnd(55)} `);

    const result = await executeSQLDirect(fileSql);

    if (result.success) {
      console.log('✅');
    } else {
      console.log('⚠️');
    }

    // 等待一下，避免请求过快
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n✅ 迁移执行完成！');
}

async function main() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   AIMAGE Supabase 自动配置                ║');
  console.log('╚════════════════════════════════════════════╝');

  try {
    // 1. 执行数据库迁移
    await runMigrations();

    // 2. 验证表创建
    await verifyTables();

    // 3. 创建存储桶
    await setupStorage();

    // 4. 配置存储桶策略
    await setupStoragePolicies();

    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║   ✅ 配置完成！                           ║');
    console.log('╚════════════════════════════════════════════╝\n');

    console.log('📋 手动配置项:\n');
    console.log('1. 配置认证 (30秒):');
    console.log('   https://supabase.com/project/oogqdhxkznhbkehkfexe/auth/providers');
    console.log('   - 启用 Email 提供商');
    console.log('   - 关闭 "Confirm email"\n');

    console.log('2. 测试应用:');
    console.log('   http://localhost:3000/signup\n');

  } catch (error) {
    console.error('\n❌ 配置过程出错:', error.message);
  }
}

main();
