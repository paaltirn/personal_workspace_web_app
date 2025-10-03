'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  HomeIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClockIcon,
  FolderIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useUserProfile } from '@/hooks/useUserProfile';

interface ModernSidebarProps {
  currentView: string;
  onViewChange: (view: 'notes' | 'todos' | 'chat' | 'stats' | 'settings' | 'pomodoro' | 'projects' | 'users') => void;
}

type ViewType = 'notes' | 'todos' | 'chat' | 'stats' | 'settings' | 'pomodoro' | 'projects' | 'users';

const menuItems = [
  { id: 'notes', label: '笔记', icon: DocumentTextIcon },
  { id: 'projects', label: '项目管理', icon: FolderIcon },
  { id: 'todos', label: '待办事项', icon: CheckCircleIcon },
  { id: 'chat', label: 'AI对话', icon: ChatBubbleLeftRightIcon },
  { id: 'stats', label: '统计', icon: ChartBarIcon },
  { id: 'pomodoro', label: '番茄钟', icon: ClockIcon },
  { id: 'users', label: '用户管理', icon: UserIcon, adminOnly: true },
  { id: 'settings', label: '设置', icon: Cog6ToothIcon }
];

export default function ModernSidebar({ currentView, onViewChange }: ModernSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { profile, isAdmin, forceRefresh } = useUserProfile();

  useEffect(() => {
    // 获取当前用户信息
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('退出登录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const sidebarVariants: Variants = {
    expanded: {
      width: '240px'
    },
    collapsed: {
      width: '80px'
    }
  };

  const transition = {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1] as const
  };

  const itemVariants = {
    expanded: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
        delay: 0.1
      }
    },
    collapsed: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <motion.div
      className="relative h-full bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-xl flex flex-col"
      variants={sidebarVariants}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      initial="expanded"
      transition={transition}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              variants={itemVariants}
              initial="expanded"
              animate="expanded"
              exit="collapsed"
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <HomeIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                个人工作台
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <AnimatePresence>
            {!isCollapsed ? (
              <motion.div
                variants={itemVariants}
                initial="expanded"
                animate="expanded"
                exit="collapsed"
                className="flex items-center space-x-3"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                     {profile?.name || user.email}
                   </p>
                   <p className="text-xs text-gray-500 dark:text-gray-400">
                     {profile?.role === 'admin' ? '管理员' : '普通用户'}
                   </p>
                   {/* 临时调试按钮 */}
                   <button 
                     onClick={forceRefresh}
                     className="text-xs text-blue-500 hover:text-blue-700 mt-1"
                   >
                     刷新角色
                   </button>
                 </div>
              </motion.div>
            ) : (
              <div className="flex justify-center">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          // 如果是管理员专用功能且用户不是管理员，则不显示
          if (item.adminOnly && !isAdmin()) {
            return null;
          }
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onViewChange(item.id as ViewType)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl"
                  layoutId="activeTab"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                />
              )}
              
              {/* Icon */}
              <div className="relative z-10">
                <Icon className={`w-6 h-6 transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200'
                }`} />
              </div>
              
              {/* Label */}
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    variants={itemVariants}
                    initial="expanded"
                    animate="expanded"
                    exit="collapsed"
                    className={`relative z-10 font-medium transition-colors duration-200 ${
                      isActive ? 'text-white' : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100'
                    }`}
                  >
                    {item.label}
                    {item.adminOnly && (
                      <span className="ml-1 text-xs opacity-75">👑</span>
                    )}
                  </motion.span>
                )}
              </AnimatePresence>
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && hoveredItem === item.id && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="absolute left-full ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-50"
                >
                  {item.label}
                  {item.adminOnly && <span className="ml-1">👑</span>}
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer with Sign Out */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
        {user && (
          <AnimatePresence>
            {!isCollapsed ? (
              <motion.div
                variants={itemVariants}
                initial="expanded"
                animate="expanded"
                exit="collapsed"
              >
                <Button
                  onClick={handleSignOut}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-sm"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                  {loading ? '退出中...' : '退出登录'}
                </Button>
              </motion.div>
            ) : (
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 flex justify-center"
                title="退出登录"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}
          </AnimatePresence>
        )}
        
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              variants={itemVariants}
              initial="expanded"
              animate="expanded"
              exit="collapsed"
              className="text-xs text-gray-500 dark:text-gray-400 text-center"
            >
              AI智能笔记助手
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}