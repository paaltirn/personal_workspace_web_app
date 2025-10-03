'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { userProfileService } from '@/lib/supabase-admin'
import { UserProfile, UpdateUserProfileData } from '@/types/user'

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // 获取当前用户档案
  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      setError(null)
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
        const defaultProfile = await userProfileService.createUserProfile(
          user.id,
          user.email || '',
          {
            name: user.email?.split('@')[0] || 'User',
            role: 'user'
          }
        )
        console.log('fetchUserProfile: 创建的默认档案:', defaultProfile);
        setProfile(defaultProfile)
      } else {
        setProfile(userProfile)
      }
    } catch (err) {
      console.error('fetchUserProfile: 获取用户档案失败:', err)
      setError('获取用户档案失败')
    } finally {
      setLoading(false)
    }
  }

  // 更新用户档案
  const updateProfile = async (updates: UpdateUserProfileData) => {
    try {
      setError(null)
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
      setError('更新用户档案失败')
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
  }, [fetchUserProfile])

  return {
    profile,
    loading,
    error,
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