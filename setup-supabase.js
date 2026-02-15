const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase 配置
const supabaseUrl = 'https://oogqdhxkznhbkehkfexe.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_KEY_HERE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigrations() {
  console.log('🚀 开始执行数据库迁移...\n');

  try {
    // 读取完整的迁移文件
    const migrationPath = path.join(__dirname, 'supabase', 'complete_migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 读取迁移文件成功');
    console.log(`📊 SQL 文件大小: ${(migrationSQL.length / 1024).toFixed(2)} KB\n`);

    // 执行迁移
    console.log('⏳ 执行 SQL 迁移...');
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (error) {
      console.error('❌ 迁移失败:', error.message);

      // 尝试分批执行
      console.log('\n🔄 尝试分批执行迁移...\n');
      await runMigrationsInBatches();
    } else {
      console.log('✅ 数据库迁移执行成功！\n');
      await verifyTables();
    }
  } catch (err) {
    console.error('❌ 执行迁移时出错:', err.message);
    console.log('\n💡 请手动在 Supabase Dashboard 执行迁移');
    console.log('   访问: https://supabase.com/project/oogqdhxkznhbkehkfexe/sql/new');
    console.log('   复制文件: supabase/complete_migration.sql\n');
  }
}

async function runMigrationsInBatches() {
  const migrationFiles = [
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

  for (const file of migrationFiles) {
    console.log(`📝 执行: ${file}`);
    const filePath = path.join(__dirname, 'supabase', 'migrations', file);
    const sql = fs.readFileSync(filePath, 'utf8');

    try {
      // 使用 Supabase 客户端执行 SQL
      // 注意: 这需要 service_role key
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ sql })
      });

      if (!response.ok) {
        console.log(`   ⚠️  ${file} 执行失败，可能已存在`);
      } else {
        console.log(`   ✅ ${file} 执行成功`);
      }
    } catch (err) {
      console.log(`   ⚠️  ${file} 执行出错: ${err.message}`);
    }
  }

  console.log('\n✅ 批量迁移完成\n');
  await verifyTables();
}

async function verifyTables() {
  console.log('🔍 验证表创建...\n');

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

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`   ❌ ${table}: 不存在或无法访问`);
      } else {
        console.log(`   ✅ ${table}: 已创建 (${count || 0} 条记录)`);
      }
    } catch (err) {
      console.log(`   ❌ ${table}: ${err.message}`);
    }
  }

  console.log('\n');
}

async function setupAuth() {
  console.log('🔐 配置认证设置...\n');
  console.log('⚠️  认证配置需要在 Supabase Dashboard 手动完成');
  console.log('   访问: https://supabase.com/project/oogqdhxkznhbkehkfexe/auth/providers');
  console.log('   1. 启用 Email 提供商');
  console.log('   2. 关闭 "Confirm email"\n');
}

async function setupStorage() {
  console.log('📦 配置存储桶...\n');

  const buckets = [
    { name: 'avatars', public: true },
    { name: 'assets', public: false },
    { name: 'videos', public: true },
    { name: 'thumbnails', public: true }
  ];

  for (const bucket of buckets) {
    try {
      const { data, error } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
        fileSizeLimit: 52428800, // 50MB
      });

      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ✅ ${bucket.name}: 已存在`);
        } else {
          console.log(`   ❌ ${bucket.name}: ${error.message}`);
        }
      } else {
        console.log(`   ✅ ${bucket.name}: 创建成功 (${bucket.public ? 'Public' : 'Private'})`);
      }
    } catch (err) {
      console.log(`   ❌ ${bucket.name}: ${err.message}`);
    }
  }

  console.log('\n');
}

async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   AIMAGE Supabase 自动配置脚本            ║');
  console.log('╚════════════════════════════════════════════╝\n');

  // 检查 Service Key
  if (supabaseServiceKey === 'YOUR_SERVICE_KEY_HERE') {
    console.log('⚠️  警告: 未设置 SUPABASE_SERVICE_KEY 环境变量\n');
    console.log('请按照以下步骤手动配置:\n');
    console.log('1. 访问: https://supabase.com/project/oogqdhxkznhbkehkfexe/settings/api');
    console.log('2. 复制 "service_role" key');
    console.log('3. 设置环境变量: set SUPABASE_SERVICE_KEY=your_key');
    console.log('4. 重新运行此脚本\n');
    console.log('或者手动执行以下步骤:\n');

    await setupAuth();
    await setupStorage();

    console.log('📝 手动执行数据库迁移:');
    console.log('   1. 访问: https://supabase.com/project/oogqdhxkznhbkehkfexe/sql/new');
    console.log('   2. 复制文件内容: supabase/complete_migration.sql');
    console.log('   3. 粘贴并点击 Run\n');

    return;
  }

  // 执行配置
  await runMigrations();
  await setupAuth();
  await setupStorage();

  console.log('╔════════════════════════════════════════════╗');
  console.log('║   配置完成！                              ║');
  console.log('╚════════════════════════════════════════════╝\n');

  console.log('🎉 下一步:');
  console.log('   1. 访问 http://localhost:3000/signup 注册新用户');
  console.log('   2. 登录并测试功能');
  console.log('   3. 检查 Supabase Dashboard 验证数据\n');
}

main().catch(console.error);
