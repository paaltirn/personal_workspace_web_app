'use client';

import { FileText, Settings, BarChart3, CheckSquare, MessageSquare, Timer, FolderKanban } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  currentView: 'notes' | 'todos' | 'chat' | 'stats' | 'settings' | 'pomodoro' | 'projects';
  onViewChange: (view: 'notes' | 'todos' | 'chat' | 'stats' | 'settings' | 'pomodoro' | 'projects') => void;
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <div className="w-20 border-r border-border bg-sidebar backdrop-blur-sm">
      <div className="flex flex-col items-center py-6 space-y-3">        <Button
          variant={currentView === 'notes' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => onViewChange('notes')}
          className={`
            h-12 w-12 rounded-xl transition-all duration-200 ease-in-out
            ${currentView === 'notes' 
              ? 'bg-primary shadow-lg scale-105' 
              : 'hover:bg-secondary hover:scale-105'
            }
          `}
          title="笔记"
        >
          <FileText className="h-5 w-5" />
        </Button>
        
        <Button
          variant={currentView === 'stats' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => onViewChange('stats')}
          className={`
            h-12 w-12 rounded-xl transition-all duration-200 ease-in-out
            ${currentView === 'stats' 
              ? 'bg-primary shadow-lg scale-105' 
              : 'hover:bg-secondary hover:scale-105'
            }
          `}
          title="统计"
        >
          <BarChart3 className="h-5 w-5" />
        </Button>
        
        <Button
          variant={currentView === 'todos' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => onViewChange('todos')}
          className={`
            h-12 w-12 rounded-xl transition-all duration-200 ease-in-out
            ${currentView === 'todos' 
              ? 'bg-primary shadow-lg scale-105' 
              : 'hover:bg-secondary hover:scale-105'
            }
          `}
          title="待办事项"
        >
          <CheckSquare className="h-5 w-5" />
        </Button>

        <Button
          variant={currentView === 'projects' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => onViewChange('projects')}
          className={`
            h-12 w-12 rounded-xl transition-all duration-200 ease-in-out
            ${currentView === 'projects' 
              ? 'bg-primary shadow-lg scale-105' 
              : 'hover:bg-secondary hover:scale-105'
            }
          `}
          title="项目管理"
        >
          <FolderKanban className="h-5 w-5" />
        </Button>

        <Button
          variant={currentView === 'chat' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => onViewChange('chat')}
          className={`
            h-12 w-12 rounded-xl transition-all duration-200 ease-in-out
            ${currentView === 'chat' 
              ? 'bg-primary shadow-lg scale-105' 
              : 'hover:bg-secondary hover:scale-105'
            }
          `}
          title="AI对话"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>

        <Button
          variant={currentView === 'pomodoro' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => onViewChange('pomodoro')}
          className={`
            h-12 w-12 rounded-xl transition-all duration-200 ease-in-out
            ${currentView === 'pomodoro' 
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 shadow-lg scale-105' 
              : 'hover:bg-secondary hover:scale-105'
            }
          `}
          title="番茄钟"
        >
          <Timer className="h-5 w-5" />
        </Button>

        <Button
          variant={currentView === 'settings' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => onViewChange('settings')}
          className={`
            h-12 w-12 rounded-xl transition-all duration-200 ease-in-out
            ${currentView === 'settings' 
              ? 'bg-primary shadow-lg scale-105' 
              : 'hover:bg-secondary hover:scale-105'
            }
          `}
          title="设置"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}