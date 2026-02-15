#!/usr/bin/env node

/**
 * AIMAGE Supabase 配置脚本
 *
 * 使用方法:
 * 1. 获取 Service Role Key:
 *    访问 https://supabase.com/project/oogqdhxkznhbkehkfexe/settings/api
 *    复制 "service_role" secret key
 *
 * 2. 运行脚本:
 *    node setup-supabase-simple.js YOUR_SERVICE_ROLE_KEY
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://oogqdhxkznhbkehkfexe.supabase.co';
const SERVICE_KEY = process.argv[2];

if (!SERVICE_KEY) {
  console.log('\n❌ 错误: 缺少 Service Role Key\n');
  console.log('使用方法:');
  console.log('  node setup-supabase-simple.js YOUR_SERVICE_ROLE_KEY\n');
  console.log('获取 Service Role Key:');
  console.log('  1. 访问: https://supabase.com/project/oogqdhxkznhbkehkfexe/settings/api');
  console.log('  2. 复制 "service_role" secret key\n');
  process.exit(1);
}

async function executeSQLFile(filename) {
  const filePath = path.join(__dirname, 'supabase', 'migrations', filename);
  const sql = fs.readFileSync(filePath, 'utf8');

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      },
      body: JSON.stringify({ query: sql })
    });

    const result = await response.text();
    return { success: response.ok, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   AIMAGE Supabase 配置脚本                ║');
  console.log('╚════════════════════════════════════════════╝\n');

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

  console.log('🚀 开始执行数据库迁移...\n');

  for (const file of files) {
    process.stdout.write(`📝 ${file.padEnd(60)} `);
    const result = await executeSQLFile(file);

    if (result.success) {
      console.log('✅');
    } else {
      console.log('⚠️');
    }
  }

  console.log('\n✅ 迁移执行完成！\n');
  console.log('📋 下一步手动配置:\n');
  console.log('1. 配置认证:');
  console.log('   https://supabase.com/project/oogqdhxkznhbkehkfexe/auth/providers\n');
  console.log('2. 创建存储桶:');
  console.log('   https://supabase.com/project/oogqdhxkznhbkehkfexe/storage/buckets');
  console.log('   - avatars (Public)');
  console.log('   - assets (Private)');
  console.log('   - videos (Public)');
  console.log('   - thumbnails (Public)\n');
  console.log('3. 测试应用:');
  console.log('   http://localhost:3000/signup\n');
}

main().catch(console.error);
