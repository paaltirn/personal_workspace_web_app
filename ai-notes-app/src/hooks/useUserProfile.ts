'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import { userProfileService } from '@/lib/supabase-admin'
import { UserProfile, UpdateUserProfileData } from '@/types/user'

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // 简单的错误处理函数，避免依赖 GlobalErrorProvider
  const handleError = (message: string) => {
    console.error('UserProfile Error:', message)
    // 可以在这里添加其他错误处理逻辑，比如显示 toast 等
  }

  // 获取当前用户档案
  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true)
      console.log('fetchUserProfile: 开始获取用户档案');

      const { data: { user } } = await supabase.auth.getUser()
      console.log('fetchUserProfile: 当前用户:', user ? user.id : 'null');
      
      if (!user) {
        console.log('fetchUserProfile: 用户未登录');
        setProfile(null)
        return
      }

      console.log('fetchUserProfile: 调用 userProfileService.getCurrentUserProfile');
      const userProfile = await userProfileService.getCurrentUserProfile(user.id)
      console.log('fetchUserProfile: 获取到的用户档案:', userProfile);
      
      // 如果用户档案不存在，创建一个默认档案
      if (!userProfile) {
        console.log('fetchUserProfile: 用户档案不存在，创建默认档案');
        
        // 检查是否是第一个用户（管理员）
        const allProfiles = await userProfileService.getAllUserProfiles()
        const isFirstUser = !allProfiles || allProfiles.length === 0
        
        const defaultProfile = await userProfileService.createUserProfile(
          user.id,
          user.email || '',
          {
            name: user.email?.split('@')[0] || 'User',
            role: isFirstUser ? 'admin' : 'user'
          }
        )
        console.log('fetchUserProfile: 创建的默认档案:', defaultProfile);
        if (defaultProfile) {
          setProfile(defaultProfile)
        } else {
          handleError('创建用户档案失败，请刷新页面重试')
        }
      } else {
        setProfile(userProfile)
      }
    } catch (err) {
      console.error('fetchUserProfile: 获取用户档案失败:', err)
      handleError('获取用户档案失败，请检查网络连接')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // 更新用户档案
  const updateProfile = async (updates: UpdateUserProfileData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('用户未登录')

      const updatedProfile = await userProfileService.updateUserProfile(user.id, updates)
      if (updatedProfile) {
        setProfile(updatedProfile)
        return true
      }
      return false
    } catch (err) {
      console.error('更新用户档案失败:', err)
      handleError('更新用户档案失败')
      return false
    }
  }

  // 检查是否为管理员
  const isAdmin = () => {
    return profile?.role === 'admin'
  }

  useEffect(() => {
    fetchUserProfile()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchUserProfile()
      } else if (event === 'SIGNED_OUT') {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchUserProfile]) // 现在可以安全地使用 fetchUserProfile 作为依赖

  return {
    profile,
    loading,
    updateProfile,
    isAdmin,
    refetch: fetchUserProfile
  }
}

// 管理员专用 Hook
export function useUserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 获取所有用户
  const fetchAllUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const allUsers = await userProfileService.getAllUserProfiles()
      setUsers(allUsers)
    } catch (err) {
      console.error('获取用户列表失败:', err)
      setError('获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 更新用户角色
  const updateUserRole = async (userId: string, role: 'admin' | 'user') => {
    try {
      setError(null)
      const updatedProfile = await userProfileService.updateUserProfile(userId, { role })
      if (updatedProfile) {
        setUsers(prev => prev.map(user => 
          user.user_id === userId ? { ...user, role } : user
        ))
        return true
      }
      return false
    } catch (err) {
      console.error('更新用户角色失败:', err)
      setError('更新用户角色失败')
      return false
    }
  }

  // 删除用户
  const deleteUser = async (userId: string) => {
    try {
      setError(null)
      const success = await userProfileService.deleteUserProfile(userId)
      if (success) {
        setUsers(prev => prev.filter(user => user.user_id !== userId))
        return true
      }
      return false
    } catch (err) {
      console.error('删除用户失败:', err)
      setError('删除用户失败')
      return false
    }
  }

  return {
    users,
    loading,
    error,
    fetchAllUsers,
    updateUserRole,
    deleteUser
  }
}