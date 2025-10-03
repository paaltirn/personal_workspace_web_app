'use client'

import { useEffect, useState } from 'react'
import { useUserProfile, useUserManagement } from '@/hooks/useUserProfile'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  UserIcon, 
  ShieldCheckIcon, 
  TrashIcon, 
  PencilIcon,
  UsersIcon 
} from '@heroicons/react/24/outline'
import { UserProfile } from '@/types/user'

interface UserCardProps {
  user: UserProfile
  onUpdateRole: (userId: string, role: 'admin' | 'user') => Promise<boolean>
  onDeleteUser: (userId: string) => Promise<boolean>
  currentUserId?: string
}

function UserCard({ user, onUpdateRole, onDeleteUser, currentUserId }: UserCardProps) {
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleRoleToggle = async () => {
    setUpdating(true)
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    await onUpdateRole(user.user_id, newRole)
    setUpdating(false)
  }

  const handleDelete = async () => {
    if (window.confirm(`确定要删除用户 ${user.name} 吗？此操作不可撤销。`)) {
      setDeleting(true)
      await onDeleteUser(user.user_id)
      setDeleting(false)
    }
  }

  const isCurrentUser = user.user_id === currentUserId

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
          <Badge 
            variant={user.role === 'admin' ? 'default' : 'secondary'}
            className={user.role === 'admin' ? 'bg-red-100 text-red-800' : ''}
          >
            {user.role === 'admin' ? '管理员' : '普通用户'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {user.bio && (
            <p className="text-sm text-muted-foreground">{user.bio}</p>
          )}
          
          <div className="text-xs text-muted-foreground">
            <p>创建时间: {new Date(user.created_at).toLocaleString('zh-CN')}</p>
            {user.updated_at && (
              <p>更新时间: {new Date(user.updated_at).toLocaleString('zh-CN')}</p>
            )}
          </div>

          <div className="flex space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRoleToggle}
              disabled={updating || isCurrentUser}
              className="flex-1"
            >
              <ShieldCheckIcon className="w-4 h-4 mr-2" />
              {updating ? '更新中...' : (user.role === 'admin' ? '设为用户' : '设为管理员')}
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting || isCurrentUser}
            >
              <TrashIcon className="w-4 h-4" />
              {deleting ? '删除中...' : '删除'}
            </Button>
          </div>

          {isCurrentUser && (
            <p className="text-xs text-blue-600 mt-2">当前用户（无法修改自己的角色或删除自己）</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function UserManagement() {
  const { profile: currentProfile, isAdmin } = useUserProfile()
  const { users, loading, error, fetchAllUsers, updateUserRole, deleteUser } = useUserManagement()

  useEffect(() => {
    if (isAdmin()) {
      fetchAllUsers()
    }
  }, [currentProfile])

  if (!isAdmin()) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert className="max-w-md">
          <ShieldCheckIcon className="h-4 w-4" />
          <AlertDescription>
            您没有权限访问用户管理功能。只有管理员才能查看此页面。
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载用户数据中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">用户管理</h1>
          <p className="text-muted-foreground">管理系统中的所有用户账户</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <UsersIcon className="w-4 h-4" />
          <span>共 {users.length} 个用户</span>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onUpdateRole={updateUserRole}
            onDeleteUser={deleteUser}
            currentUserId={currentProfile?.user_id}
          />
        ))}
      </div>

      {users.length === 0 && !loading && (
        <div className="text-center py-12">
          <UsersIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">暂无用户数据</h3>
          <p className="text-sm text-muted-foreground">
            系统中还没有用户注册，或者数据加载出现问题。
          </p>
          <Button 
            variant="outline" 
            onClick={fetchAllUsers}
            className="mt-4"
          >
            重新加载
          </Button>
        </div>
      )}
    </div>
  )
}