// 检查数据库表是否存在的脚本
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('缺少 Supabase 环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabase() {
  console.log('检查数据库连接...');
  
  try {
    // 检查 user_profiles 表
    console.log('\n检查 user_profiles 表...');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('user_profiles 表错误:', profilesError);
    } else {
      console.log('✅ user_profiles 表存在');
    }

    // 检查 notes 表
    console.log('\n检查 notes 表...');
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('*')
      .limit(1);
    
    if (notesError) {
      console.error('notes 表错误:', notesError);
    } else {
      console.log('✅ notes 表存在');
    }

    // 检查 projects 表
    console.log('\n检查 projects 表...');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(1);
    
    if (projectsError) {
      console.error('projects 表错误:', projectsError);
    } else {
      console.log('✅ projects 表存在');
    }

    // 检查当前用户
    console.log('\n检查当前用户...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('获取用户错误:', userError);
    } else if (user) {
      console.log('✅ 用户已登录:', user.id, user.email);
    } else {
      console.log('❌ 用户未登录');
    }

  } catch (error) {
    console.error('检查数据库时发生错误:', error);
  }
}

checkDatabase();