const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://oogqdhxkznhbkehkfexe.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vZ3FkaHhrem5oYmtlaGtmZXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTEyODg3NiwiZXhwIjoyMDg2NzA0ODc2fQ.JtXVa3T4TVcrSynHnnHWRkNcKt15LI68nAhuhDpQjPc';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function insertShowcaseCases() {
  console.log('\n📝 插入案例库种子数据...\n');

  const cases = [
    {
      title: '美食探店 - 火锅篇',
      description: '展示成都火锅店的热闹氛围和美味佳肴',
      category: 'food',
      video_url: 'https://example.com/videos/hotpot.mp4',
      thumbnail_url: 'https://example.com/thumbnails/hotpot.jpg',
      duration: 30,
      views: 15234,
      likes: 892
    },
    {
      title: '旅行 Vlog - 云南大理',
      description: '记录大理古城的美丽风光和人文风情',
      category: 'travel',
      video_url: 'https://example.com/videos/dali.mp4',
      thumbnail_url: 'https://example.com/thumbnails/dali.jpg',
      duration: 60,
      views: 28456,
      likes: 1523
    },
    {
      title: '产品开箱 - 最新款手机',
      description: '详细展示新手机的外观设计和核心功能',
      category: 'product',
      video_url: 'https://example.com/videos/phone.mp4',
      thumbnail_url: 'https://example.com/thumbnails/phone.jpg',
      duration: 45,
      views: 45678,
      likes: 2341
    },
    {
      title: '知识分享 - AI 入门指南',
      description: '用简单易懂的方式讲解 AI 基础概念',
      category: 'education',
      video_url: 'https://example.com/videos/ai-guide.mp4',
      thumbnail_url: 'https://example.com/thumbnails/ai-guide.jpg',
      duration: 90,
      views: 67890,
      likes: 3456
    },
    {
      title: '生活记录 - 我的一天',
      description: '记录普通人的日常生活点滴',
      category: 'lifestyle',
      video_url: 'https://example.com/videos/daily.mp4',
      thumbnail_url: 'https://example.com/thumbnails/daily.jpg',
      duration: 30,
      views: 12345,
      likes: 678
    }
  ];

  for (const caseData of cases) {
    const { data, error } = await supabase
      .from('showcase_cases')
      .insert(caseData)
      .select()
      .single();

    if (error) {
      console.log(`   ❌ ${caseData.title}: ${error.message}`);
    } else {
      console.log(`   ✅ ${caseData.title}`);
    }
  }

  console.log('\n');
}

async function verifySetup() {
  console.log('\n🔍 验证配置状态...\n');

  // 检查表记录数
  const tables = [
    'profiles',
    'credit_transactions',
    'projects',
    'showcase_cases'
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
  console.log('\n📦 存储桶状态:\n');
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

  if (bucketsError) {
    console.log(`   ❌ 无法获取存储桶列表: ${bucketsError.message}`);
  } else {
    buckets.forEach(bucket => {
      console.log(`   ✅ ${bucket.name.padEnd(15)} (${bucket.public ? 'Public' : 'Private'})`);
    });
  }

  console.log('\n');
}

async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   AIMAGE 配置验证与修复                   ║');
  console.log('╚════════════════════════════════════════════╝');

  try {
    await insertShowcaseCases();
    await verifySetup();

    console.log('╔════════════════════════════════════════════╗');
    console.log('║   ✅ 验证完成！                           ║');
    console.log('╚════════════════════════════════════════════╝\n');

    console.log('📋 剩余手动配置:\n');
    console.log('1. 配置认证 (30秒):');
    console.log('   https://supabase.com/project/oogqdhxkznhbkehkfexe/auth/providers');
    console.log('   - 启用 Email 提供商');
    console.log('   - 启用 Email Signup');
    console.log('   - 关闭 "Confirm email"\n');

    console.log('2. 配置存储桶策略 (1分钟):');
    console.log('   https://supabase.com/project/oogqdhxkznhbkehkfexe/sql/new');
    console.log('   - 复制 MANUAL_SETUP_GUIDE.md 中的存储桶策略 SQL');
    console.log('   - 粘贴并执行\n');

    console.log('3. 测试应用:');
    console.log('   http://localhost:3000/signup\n');

  } catch (error) {
    console.error('\n❌ 执行出错:', error.message);
  }
}

main();
