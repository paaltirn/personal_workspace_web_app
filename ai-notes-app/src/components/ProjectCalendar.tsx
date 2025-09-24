'use client';

import { useState, useMemo } from 'react';
import { ProjectTask } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Badge } from './ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectCalendarProps {
  tasks: ProjectTask[];
}

export default function ProjectCalendar({
  tasks
}: ProjectCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  const getPriorityColor = (priority: ProjectTask['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusColor = (status: ProjectTask['status']) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: ProjectTask['status']) => {
    switch (status) {
      case 'todo':
        return '待办';
      case 'in_progress':
        return '进行中';
      case 'completed':
        return '已完成';
      default:
        return '待办';
    }
  };

  const isOverdue = (task: ProjectTask) => {
    return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSameDate = (date1: Date, date2: Date | null) => {
    if (!date2) return false;
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const calendarDays = useMemo(() => {
    const days = [];
    
    // 添加上个月的日期填充
    for (let i = 0; i < firstDayOfWeek; i++) {
      const date = new Date(currentYear, currentMonth, -firstDayOfWeek + i + 1);
      days.push({ date, isCurrentMonth: false });
    }
    
    // 添加当前月的日期
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      days.push({ date, isCurrentMonth: true });
    }
    
    // 添加下个月的日期填充
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(currentYear, currentMonth + 1, day);
      days.push({ date, isCurrentMonth: false });
    }
    
    return days;
  }, [currentYear, currentMonth, firstDayOfWeek, daysInMonth]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* 日历视图 */}
      <div className="lg:col-span-2">
        <div className="bg-card border rounded-lg p-4">
          {/* 日历头部 */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h3 className="font-semibold text-lg">
              {currentYear}年 {monthNames[currentMonth]}
            </h3>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* 星期标题 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* 日历网格 */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(({ date, isCurrentMonth }, index) => {
              const dayTasks = getTasksForDate(date);
              const hasOverdue = dayTasks.some(task => isOverdue(task));
              
              return (
                <div
                  key={index}
                  className={cn(
                    "min-h-[80px] p-1 border rounded cursor-pointer transition-colors hover:bg-muted/50",
                    !isCurrentMonth && "text-muted-foreground bg-muted/20",
                    isToday(date) && "bg-primary/10 border-primary",
                    isSameDate(date, selectedDate) && "bg-primary/20 border-primary",
                    hasOverdue && "bg-red-50 border-red-200"
                  )}
                  onClick={() => setSelectedDate(date)}
                >
                  <div className="text-sm font-medium mb-1">{date.getDate()}</div>
                  <div className="space-y-1">
                    {dayTasks.slice(0, 2).map((task) => (
                      <div
                        key={task.id}
                        className={cn(
                          "text-xs p-1 rounded truncate",
                          task.status === 'completed' ? "bg-green-100 text-green-800" :
                          isOverdue(task) ? "bg-red-100 text-red-800" :
                          "bg-blue-100 text-blue-800"
                        )}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayTasks.length - 2}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* 任务详情面板 */}
      <div className="lg:col-span-1">
        <div className="bg-card border rounded-lg p-4 h-full">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-4 w-4" />
            <h3 className="font-semibold">
              {selectedDate ? (
                `${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日任务`
              ) : (
                '选择日期查看任务'
              )}
            </h3>
          </div>
          
          <div className="space-y-3 overflow-y-auto max-h-[500px]">
            {selectedDateTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                {selectedDate ? '该日期暂无任务' : '点击日历上的日期查看任务'}
              </div>
            ) : (
              selectedDateTasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "p-3 border rounded-lg",
                    isOverdue(task) ? "border-red-200 bg-red-50/50" : "border-border"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm line-clamp-2 flex-1">{task.title}</h4>
                    <Flag className={cn("h-3 w-3 ml-2", getPriorityColor(task.priority))} />
                  </div>
                  
                  {task.description && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={cn("text-xs px-2 py-0.5", getStatusColor(task.status))}
                    >
                      {getStatusText(task.status)}
                    </Badge>
                    
                    {isOverdue(task) && (
                      <Badge variant="outline" className="text-xs px-2 py-0.5 bg-red-100 text-red-800 border-red-200">
                        逾期
                      </Badge>
                    )}
                    
                    {task.assignee && (
                      <span className="text-xs text-muted-foreground">
                        负责人: {task.assignee}
                      </span>
                    )}
                  </div>
                  
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-2">
                      {task.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-secondary px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}