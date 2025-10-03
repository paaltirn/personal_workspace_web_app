// 测试用户档案创建的脚本
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('缺少 Supabase 环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testProfileCreation() {
  console.log('测试用户档案创建...');
  
  try {
    // 首先检查当前用户
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('当前用户:', user ? user.id : 'null');
    console.log('用户错误:', userError);
    
    if (!user) {
      console.log('用户未登录，无法测试档案创建');
      return;
    }
    
    // 尝试创建用户档案
    const testProfile = {
      user_id: user.id,
      email: user.email || 'test@example.com',
      name: 'Test User',
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('尝试插入档案:', testProfile);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(testProfile)
      .select()
      .single();
    
    console.log('插入结果 data:', data);
    console.log('插入结果 error:', error);
    
  } catch (err) {
    console.error('测试过程中发生错误:', err);
  }
}

testProfileCreation();
