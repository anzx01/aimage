const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://oogqdhxkznhbkehkfexe.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vZ3FkaHhrem5oYmtlaGtmZXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTEyODg3NiwiZXhwIjoyMDg2NzA0ODc2fQ.JtXVa3T4TVcrSynHnnHWRkNcKt15LI68nAhuhDpQjPc';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifySetup() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   AIMAGE 配置验证                         ║');
  console.log('╚════════════════════════════════════════════╝\n');

  // 检查表
  console.log('📊 数据库表:\n');
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
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`   ❌ ${table.padEnd(25)} 错误: ${error.message}`);
    } else {
      console.log(`   ✅ ${table.padEnd(25)} ${count || 0} 条记录`);
    }
  }

  // 检查存储桶
  console.log('\n📦 存储桶:\n');
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

  if (bucketsError) {
    console.log(`   ❌ 无法获取存储桶列表: ${bucketsError.message}`);
  } else {
    buckets.forEach(bucket => {
      console.log(`   ✅ ${bucket.name.padEnd(15)} (${bucket.public ? 'Public' : 'Private'})`);
    });
  }

  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   ✅ 配置验证完成！                       ║');
  console.log('╚════════════════════════════════════════════╝\n');

  console.log('🎉 下一步:\n');
  console.log('1. 配置认证 (如果还没做):');
  console.log('   https://supabase.com/project/oogqdhxkznhbkehkfexe/auth/providers');
  console.log('   - 启用 Email 提供商');
  console.log('   - 启用 Email Signup');
  console.log('   - 关闭 "Confirm email"\n');
  console.log('2. 测试应用:');
  console.log('   http://localhost:3000/signup\n');
}

verifySetup().catch(console.error);
