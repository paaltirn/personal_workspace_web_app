import { createClient } from '@supabase/supabase-js'
import { UserProfile, CreateUserProfileData, UpdateUserProfileData } from '@/types/user'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey)

// 用户档案管理函数
export const userProfileService = {
  // 获取当前用户档案
  async getCurrentUserProfile(userId: string): Promise<UserProfile | null> {
    console.log('getCurrentUserProfile: 开始获取用户档案，用户ID:', userId);
    
    try {
      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      console.log('getCurrentUserProfile: 数据库响应 data:', data);
      console.log('getCurrentUserProfile: 数据库响应 error:', error);

      if (error) {
        console.error('getCurrentUserProfile: 获取用户档案失败:', error)
        
        // 如果是表不存在或者记录不存在的错误，返回 null 而不是抛出错误
        if (error.code === 'PGRST116' || error.code === '42P01') {
          console.log('getCurrentUserProfile: 用户档案不存在，将创建新档案');
          return null;
        }
        
        return null
      }

      console.log('getCurrentUserProfile: 成功获取用户档案:', data);
      return data
    } catch (err) {
      console.error('getCurrentUserProfile: 发生异常:', err);
      return null;
    }
  },

  // 创建用户档案
  async createUserProfile(userId: string, email: string, profileData: CreateUserProfileData): Promise<UserProfile | null> {
    console.log('createUserProfile: 开始创建用户档案', { userId, email, profileData });
    
    try {
      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          user_id: userId,
          email,
          name: profileData.name,
          role: profileData.role || 'user',
          bio: profileData.bio,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      console.log('createUserProfile: 数据库响应 data:', data);
      console.log('createUserProfile: 数据库响应 error:', error);

      if (error) {
        console.error('createUserProfile: 创建用户档案失败:', error)
        return null
      }

      console.log('createUserProfile: 成功创建用户档案:', data);
      return data
    } catch (err) {
      console.error('createUserProfile: 发生异常:', err);
      return null;
    }
  },

  // 更新用户档案
  async updateUserProfile(userId: string, updates: UpdateUserProfileData): Promise<UserProfile | null> {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('更新用户档案失败:', error)
      return null
    }

    return data
  },

  // 获取所有用户档案（管理员功能）
  async getAllUserProfiles(): Promise<UserProfile[]> {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取用户列表失败:', error)
      return []
    }

    return data || []
  },

  // 删除用户档案（管理员功能）
  async deleteUserProfile(userId: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('user_id', userId)

    if (error) {
      console.error('删除用户档案失败:', error)
      return false
    }

    return true
  },

  // 检查用户是否为管理员
  async isUserAdmin(userId: string): Promise<boolean> {
    const profile = await this.getCurrentUserProfile(userId)
    return profile?.role === 'admin'
  }
}