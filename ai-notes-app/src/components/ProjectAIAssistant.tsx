'use client';

import { useState } from 'react';
import { Project, ProjectTask } from '@/types/project';
import { Settings } from '@/types/note';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Brain, Target, TrendingUp, Lightbulb, Clock, FileText, MessageSquare, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Typewriter from './Typewriter';

interface ProjectAIAssistantProps {
  project: Project;
  tasks: ProjectTask[];
  settings: Settings;
  onAddTask: (task: Omit<ProjectTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTask: (id: string, updates: Partial<ProjectTask>) => void;
}

interface AISuggestion {
  type: 'task_breakdown' | 'priority_optimization' | 'progress_prediction' | 'workflow_improvement' | 'progress_summary' | 'smart_assignment' | 'meeting_notes';
  title: string;
  content: string;
  actionable: boolean;
  confidence: number;
  data?: unknown; // 用于存储额外的结构化数据
}

// 建议卡片组件
const SuggestionCard = ({ suggestion, icon: Icon, colorClass, priority, index, onQuickAction }: {
  suggestion: AISuggestion;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  priority: 'high' | 'medium' | 'low';
  index: number;
  onQuickAction: (suggestion: AISuggestion) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRawData, setShowRawData] = useState(false);
  
  // 解析建议内容
  const parseContent = (content: string) => {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const parsed = JSON.parse(jsonStr);
        const beforeJson = content.substring(0, content.indexOf(jsonStr)).trim();
        const afterJson = content.substring(content.indexOf(jsonStr) + jsonStr.length).trim();
        
        // 提取结构化信息
        let summary = beforeJson || '智能分析建议';
        let details = afterJson;
        
        if (parsed.tasks && Array.isArray(parsed.tasks)) {
          summary = `发现 ${parsed.tasks.length} 个可优化任务`;
          details = parsed.tasks.map((task: any, i: number) => 
            `${i + 1}. ${task.title || task.name || '未命名任务'}`
          ).join('\n');
        } else if (parsed.summary) {
          summary = '项目进展总结';
          details = parsed.summary;
        } else if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
          summary = `${parsed.recommendations.length} 条优化建议`;
          details = parsed.recommendations.map((rec: any, i: number) => 
            `${i + 1}. ${rec.title || rec.description || rec}`
          ).join('\n');
        }
        
        return { summary, details, rawData: jsonStr, hasStructuredData: true };
      }
    } catch (e) {
      // JSON解析失败，按普通文本处理
    }
    
    // 普通文本处理
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length <= 1) {
      return { summary: content, details: '', rawData: '', hasStructuredData: false };
    }
    
    const summary = lines[0];
    const details = lines.slice(1).join('\n');
    return { summary, details, rawData: content, hasStructuredData: false };
  };
  
  const { summary, details, rawData, hasStructuredData } = parseContent(suggestion.content);
  const shouldShowExpand = details.length > 100 || details.split('\n').length > 3;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`border rounded-md p-3 transition-all duration-200 hover:shadow-sm cursor-pointer ${
        priority === 'high' ? 'border-orange-200 bg-orange-50/50' : 'bg-card hover:bg-muted/20'
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* 紧凑的头部信息 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Icon className={`h-4 w-4 ${colorClass} flex-shrink-0`} />
          <span className="font-medium text-sm text-foreground truncate">{suggestion.title}</span>
          {priority === 'high' && <span className="text-orange-500">🔥</span>}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
            {Math.round(suggestion.confidence * 100)}%
          </Badge>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-muted-foreground"
          >
            ▼
          </motion.div>
        </div>
      </div>
      
      {/* 简要描述 */}
      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{summary}</p>
      
      {/* 展开的详细内容 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 pt-3 border-t space-y-2"
          >
            {details && (
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line bg-muted/20 rounded p-2 max-h-32 overflow-y-auto">
                {details}
              </div>
            )}
            
            <div className="flex items-center gap-2">
              {suggestion.actionable && (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickAction(suggestion);
                  }}
                  className="h-6 px-2 text-xs"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  应用
                </Button>
              )}
              
              {hasStructuredData && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRawData(!showRawData);
                  }}
                  className="h-6 px-2 text-xs text-muted-foreground"
                >
                  {showRawData ? '隐藏' : '原始'}数据
                </Button>
              )}
            </div>
            
            {/* 原始数据 */}
            {showRawData && hasStructuredData && (
              <pre className="text-xs font-mono bg-muted/30 rounded p-2 overflow-x-auto max-h-24 overflow-y-auto">
                {rawData}
              </pre>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function ProjectAIAssistant({
  project,
  tasks,
  settings,
  onAddTask,
  onUpdateTask
}: ProjectAIAssistantProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [userInput, setUserInput] = useState('');
  const [showTypewriter, setShowTypewriter] = useState(false);

  const analyzeProject = async () => {
    console.log('🔍 开始分析项目...');
    console.log('📋 项目数据:', { project, tasks: tasks.length, settings: !!settings.openRouterApiKey });
    console.log('🔑 API密钥详情:', {
      hasKey: !!settings.openRouterApiKey,
      keyLength: settings.openRouterApiKey?.length || 0,
      keyPrefix: settings.openRouterApiKey?.substring(0, 10) + '...',
      model: settings.aiModel
    });
    
    if (!settings.openRouterApiKey) {
      console.log('❌ API密钥未配置');
      setSuggestions([{
        type: 'workflow_improvement',
        title: '⚠️ 需要配置 API 密钥',
        content: '请先在设置页面中配置 OpenRouter API 密钥，然后再使用 AI 功能。\n\n1. 点击左侧菜单的"设置"\n2. 输入您的 OpenRouter API 密钥\n3. 点击"保存设置"',
        actionable: false,
        confidence: 1.0
      }]);
      return;
    }
    
    console.log('✅ API密钥已配置，开始请求...');

    setIsAnalyzing(true);
    setShowTypewriter(true);
    
    try {
      const projectContext = {
        project: {
          name: project.name,
          description: project.description,
          status: project.status,
          dueDate: project.dueDate
        },
        tasks: tasks.map(task => ({
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          tags: task.tags
        })),
        stats: {
          totalTasks: tasks.length,
          completedTasks: tasks.filter(t => t.status === 'completed').length,
          overdueTasks: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length
        }
      };



      const prompt = `作为一个AI项目管理助手，请分析以下项目数据并提供智能建议：

项目信息：${JSON.stringify(projectContext, null, 2)}

请提供以下类型的建议：
1. 任务分解建议（如果有复杂任务可以进一步分解）
2. 优先级优化建议（基于截止时间和依赖关系）
3. 进度预测和风险提醒
4. 工作流程改进建议

请以JSON格式返回，每个建议包含：type, title, content, actionable, confidence字段。`;

      console.log('🚀 发送API请求到OpenRouter...');
      console.log('🔑 使用模型:', settings.aiModel || 'deepseek/deepseek-chat-v3.1');
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Personal Workspace'
        },
        body: JSON.stringify({
          model: settings.aiModel || 'deepseek/deepseek-chat-v3.1',
          messages: [
            {
              role: 'system',
              content: '你是一个专业的AI项目管理助手，擅长分析项目数据并提供实用的管理建议。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });
      
      console.log('📡 API响应状态:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API请求失败:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`AI 分析请求失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;
      
      // 尝试解析JSON响应
      try {
        const parsedSuggestions = JSON.parse(aiResponse);
        setSuggestions(Array.isArray(parsedSuggestions) ? parsedSuggestions : [parsedSuggestions]);
      } catch {
        // 如果不是JSON格式，创建一个通用建议
        setSuggestions([{
          type: 'workflow_improvement',
          title: 'AI 分析结果',
          content: aiResponse,
          actionable: false,
          confidence: 0.8
        }]);
      }
    } catch (error) {
      console.error('AI 分析失败:', error);
      setSuggestions([{
        type: 'workflow_improvement',
        title: '分析失败',
        content: '无法连接到AI服务，请检查网络连接和API密钥配置。',
        actionable: false,
        confidence: 0
      }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuickAction = async (suggestion: AISuggestion) => {
    switch (suggestion.type) {
      case 'task_breakdown':
        if (suggestion.actionable) {
          // 智能创建子任务
          const taskTitle = `${suggestion.title} - 子任务`;
          onAddTask({
            projectId: project.id,
            title: taskTitle,
            description: suggestion.content,
            status: 'todo',
            priority: 'medium',
            assignee: '我'
          });
        }
        break;
        
      case 'smart_assignment':
        if (suggestion.actionable && suggestion.data) {
          // 应用智能任务分配
          suggestion.data.forEach((assignment: any) => {
            const task = tasks.find(t => t.id === assignment.taskId);
            if (task) {
              onUpdateTask(task.id, {
                assignee: assignment.suggestedAssignee
              });
            }
          });
          
          // 显示成功反馈
          setSuggestions(prev => [
            {
              type: 'workflow_improvement',
              title: '✅ 任务分配已更新',
              content: `已成功更新 ${suggestion.data.length} 个任务的分配情况`,
              actionable: false,
              confidence: 1.0
            },
            ...prev.filter(s => s !== suggestion)
          ]);
        }
        break;
        
      default:
        // 其他类型的快速操作可以在这里添加
        break;
    }
  };

  const handleNaturalLanguageInput = async () => {
    if (!userInput.trim() || !settings.openRouterApiKey) {
      if (!settings.openRouterApiKey) {
        setSuggestions([{
          type: 'workflow_improvement',
          title: '⚠️ 需要配置 API 密钥',
          content: '请先在设置页面中配置 OpenRouter API 密钥，然后再使用 AI 功能。\n\n1. 点击左侧菜单的"设置"\n2. 输入您的 OpenRouter API 密钥\n3. 点击"保存设置"',
          actionable: false,
          confidence: 1.0
        }]);
      }
      return;
    }

    setIsAnalyzing(true);
    setShowTypewriter(true);
    
    try {
      const projectContext = {
        project: {
          name: project.name,
          description: project.description,
          status: project.status
        },
        tasks: tasks.map(task => ({
          title: task.title,
          status: task.status,
          priority: task.priority,
          assignee: task.assignee,
          dueDate: task.dueDate
        })),
        stats: {
          total: tasks.length,
          completed: tasks.filter(t => t.status === 'completed').length,
          inProgress: tasks.filter(t => t.status === 'in_progress').length,
          todo: tasks.filter(t => t.status === 'todo').length
        }
      };

      const prompt = `作为一个AI项目管理助手，请分析用户的自然语言输入并识别请求类型。

当前项目信息：${JSON.stringify(projectContext, null, 2)}

用户输入："${userInput}"

请识别用户的意图并返回相应的操作。支持的操作类型：
1. task_creation - 创建新任务
2. progress_summary - 总结项目进展
3. task_assignment - 智能分配任务
4. meeting_notes - 会议记录转任务
5. general_query - 一般咨询

返回格式：
{
  "actionType": "task_creation" | "progress_summary" | "task_assignment" | "meeting_notes" | "general_query",
  "tasks": [{ // 用于task_creation和meeting_notes
    "title": string,
    "description": string,
    "priority": "high" | "medium" | "low",
    "dueDate": string | null,
    "assignee": string | null,
    "tags": string[]
  }],
  "summary": { // 仅当actionType为progress_summary时
    "overallProgress": string,
    "completedTasks": string[],
    "pendingTasks": string[],
    "recommendations": string[]
  },
  "assignments": [{ // 仅当actionType为task_assignment时
    "taskId": string,
    "suggestedAssignee": string,
    "reason": string
  }],
  "meetingAnalysis": { // 仅当actionType为meeting_notes时
    "meetingDate": string,
    "participants": string[],
    "keyDecisions": string[],
    "actionItems": string[],
    "followUpNeeded": string[]
  },
  "response": string
}`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Personal Workspace'
        },
        body: JSON.stringify({
          model: settings.aiModel,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的AI项目管理助手，擅长理解自然语言并提取任务信息。请严格按照JSON格式返回结果。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('自然语言处理API请求失败:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`AI 处理请求失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;
      
      try {
         const parsedResponse = JSON.parse(aiResponse);
         
         switch (parsedResponse.actionType) {
           case 'task_creation':
             if (parsedResponse.tasks && parsedResponse.tasks.length > 0) {
               // 创建任务
               parsedResponse.tasks.forEach((task: any) => {
                 onAddTask({
                   projectId: project.id,
                   title: task.title,
                   description: task.description,
                   status: 'todo',
                   priority: task.priority || 'medium',
                   assignee: task.assignee || '我',
                   dueDate: task.dueDate,
                   tags: task.tags || []
                 });
               });
               
               setSuggestions([{
                 type: 'task_breakdown',
                 title: '✅ 任务创建成功',
                 content: `已成功创建 ${parsedResponse.tasks.length} 个任务：${parsedResponse.tasks.map((t: any) => t.title).join('、')}`,
                 actionable: false,
                 confidence: 1.0
               }]);
             }
             break;
             
           case 'progress_summary':
             if (parsedResponse.summary) {
               const summary = parsedResponse.summary;
               setSuggestions([{
                 type: 'progress_summary',
                 title: '📊 项目进展总结',
                 content: `${summary.overallProgress}\n\n✅ 已完成：${summary.completedTasks?.join('、') || '无'}\n\n⏳ 待处理：${summary.pendingTasks?.join('、') || '无'}\n\n💡 建议：${summary.recommendations?.join('；') || '暂无建议'}`,
                 actionable: false,
                 confidence: 0.9,
                 data: summary
               }]);
             }
             break;
             
           case 'task_assignment':
              if (parsedResponse.assignments && parsedResponse.assignments.length > 0) {
                setSuggestions([{
                  type: 'smart_assignment',
                  title: '🎯 智能任务分配建议',
                  content: parsedResponse.assignments.map((a: any) => 
                    `任务：${tasks.find(t => t.id === a.taskId)?.title || '未知任务'} → 建议分配给：${a.suggestedAssignee}\n原因：${a.reason}`
                  ).join('\n\n'),
                  actionable: true,
                  confidence: 0.8,
                  data: parsedResponse.assignments
                }]);
              }
              break;
              
            case 'meeting_notes':
              if (parsedResponse.tasks && parsedResponse.tasks.length > 0) {
                // 创建会议相关任务
                parsedResponse.tasks.forEach((task: any) => {
                  onAddTask({
                    projectId: project.id,
                    title: task.title,
                    description: task.description,
                    status: 'todo',
                    priority: task.priority || 'medium',
                    assignee: task.assignee || '我',
                    dueDate: task.dueDate,
                    tags: [...(task.tags || []), '会议记录']
                  });
                });
                
                // 显示会议分析结果
                const analysis = parsedResponse.meetingAnalysis;
                setSuggestions([{
                  type: 'meeting_notes',
                  title: '📝 会议记录分析完成',
                  content: `已从会议记录中提取并创建了 ${parsedResponse.tasks.length} 个任务\n\n📅 会议时间：${analysis?.meetingDate || '未指定'}\n👥 参与人员：${analysis?.participants?.join('、') || '未指定'}\n✅ 关键决策：${analysis?.keyDecisions?.join('；') || '无'}\n📋 行动项目：${analysis?.actionItems?.join('；') || '无'}`,
                  actionable: false,
                  confidence: 0.9,
                  data: analysis
                }]);
              }
              break;
             
           default:
             // 一般查询或其他情况
             setSuggestions([{
               type: 'workflow_improvement',
               title: '🤖 AI 助手回复',
               content: parsedResponse.response || '我理解了您的需求，如需更多帮助请提供更详细的信息。',
               actionable: false,
               confidence: 0.8
             }]);
         }
      } catch {
        // 如果不是JSON格式，显示原始回复
        setSuggestions([{
          type: 'workflow_improvement',
          title: 'AI 助手回复',
          content: aiResponse,
          actionable: false,
          confidence: 0.8
        }]);
      }
    } catch (error) {
      console.error('自然语言处理失败:', error);
      setSuggestions([{
        type: 'workflow_improvement',
        title: '处理失败',
        content: '无法处理您的输入，请检查网络连接和API密钥配置。',
        actionable: false,
        confidence: 0
      }]);
    } finally {
      setIsAnalyzing(false);
      setUserInput('');
    }
  };

  const getSuggestionIcon = (type: AISuggestion['type']) => {
    switch (type) {
      case 'task_breakdown': return Target;
      case 'priority_optimization': return TrendingUp;
      case 'progress_prediction': return Clock;
      case 'workflow_improvement': return Lightbulb;
      case 'progress_summary': return TrendingUp;
      case 'smart_assignment': return Target;
      case 'meeting_notes': return FileText;
      default: return Brain;
    }
  };

  const getSuggestionColor = (type: AISuggestion['type']) => {
    switch (type) {
      case 'task_breakdown': return 'text-blue-600';
      case 'priority_optimization': return 'text-orange-600';
      case 'progress_prediction': return 'text-green-600';
      case 'workflow_improvement': return 'text-purple-600';
      case 'progress_summary': return 'text-indigo-600';
      case 'smart_assignment': return 'text-pink-600';
      case 'meeting_notes': return 'text-teal-600';
      default: return 'text-gray-600';
    }
  };

  // 根据置信度确定优先级
  const getPriorityFromConfidence = (confidence: number): 'high' | 'medium' | 'low' => {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
  };

  // 获取优先级配置
  const getPriorityConfig = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200',
          icon: '🔥',
          label: '高优先级'
        };
      case 'medium':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 border-yellow-200',
          icon: '⚡',
          label: '中优先级'
        };
      case 'low':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 border-blue-200',
          icon: '💡',
          label: '低优先级'
        };
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          AI 项目助手
        </CardTitle>
        <CardDescription>
          让AI分析您的项目，提供智能建议和优化方案
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 核心功能区 */}
        <div className="space-y-3">
          <div className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-600" />
            核心分析功能
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Button 
              onClick={analyzeProject} 
              disabled={isAnalyzing}
              size="sm"
              className="w-full justify-start"
            >
              <Brain className="h-4 w-4 mr-2" />
              {isAnalyzing ? '分析中...' : '项目分析'}
            </Button>
            <Button 
              onClick={async () => {
                setUserInput('总结一下当前项目的进展情况');
                setTimeout(() => {
                  handleNaturalLanguageInput();
                }, 100);
              }}
              disabled={isAnalyzing}
              variant="outline"
              size="sm"
              className="w-full justify-start"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              进度总结
            </Button>
          </div>
        </div>
        
        {/* 智能优化功能 */}
        <div className="space-y-3">
          <div className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" />
            智能优化
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Button 
              onClick={async () => {
                setUserInput('帮我优化任务的优先级安排');
                setTimeout(() => {
                  handleNaturalLanguageInput();
                }, 100);
              }}
              disabled={isAnalyzing}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sm"
            >
              <Target className="h-4 w-4 mr-2" />
              优先级优化
            </Button>
            <Button 
              onClick={async () => {
                setUserInput('智能分配当前的待办任务');
                setTimeout(() => {
                  handleNaturalLanguageInput();
                }, 100);
              }}
              disabled={isAnalyzing}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sm"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              智能分配
            </Button>
            <Button 
              onClick={async () => {
                setUserInput('预测项目完成时间和可能的风险');
                setTimeout(() => {
                  handleNaturalLanguageInput();
                }, 100);
              }}
              disabled={isAnalyzing}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sm"
            >
              <Clock className="h-4 w-4 mr-2" />
              风险预测
            </Button>
          </div>
        </div>
        
        {/* 会议记录处理 */}
        <div className="space-y-3">
          <div className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-green-600" />
            会议记录转任务
          </div>
          <Button 
            onClick={async () => {
              setUserInput('请将以下会议记录转换为具体任务：\n\n[在此粘贴您的会议记录内容]');
            }}
            disabled={isAnalyzing}
            variant="outline"
            size="sm"
            className="w-full justify-start text-sm"
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            处理会议记录
          </Button>
        </div>

        {/* 打字机效果显示处理状态 */}
        <AnimatePresence>
          {showTypewriter && isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-muted/50 rounded-lg p-3"
            >
              <Typewriter
                text={userInput.trim() ? "正在理解您的需求..." : "正在分析项目结构..."}
                delay={100}
                cursor={true}
                onComplete={() => setShowTypewriter(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI建议列表 - 卡片式展示 */}
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm text-muted-foreground">AI 智能建议</h4>
                <Badge variant="secondary" className="text-xs">
                  {suggestions.length} 条建议
                </Badge>
              </div>
              <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                {suggestions.map((suggestion, index) => {
                  const Icon = getSuggestionIcon(suggestion.type);
                  const colorClass = getSuggestionColor(suggestion.type);
                  const priority = getPriorityFromConfidence(suggestion.confidence);
                  const priorityConfig = getPriorityConfig(priority);
                  
                  return (
                    <SuggestionCard
                      key={index}
                      suggestion={suggestion}
                      icon={Icon}
                      colorClass={colorClass}
                      priority={priority}
                      index={index}
                      onQuickAction={handleQuickAction}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 自然语言交互 */}
        <div className="space-y-3 border-t pt-6">
          <div className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-orange-600" />
            自然语言交互
          </div>
          <Textarea
             placeholder={`试试这些输入：
• 帮我新建一个关于市场分析的任务，指派给小李，明天截止
• 总结一下本周XX项目的进展
• 创建三个UI设计相关的高优先级任务`}
             value={userInput}
             onChange={(e) => setUserInput(e.target.value)}
             className="min-h-[100px] resize-none"
           />
          <div className="grid grid-cols-2 gap-2">
            <Button 
              size="sm" 
              disabled={!userInput.trim() || isAnalyzing}
              onClick={handleNaturalLanguageInput}
              className="w-full"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isAnalyzing ? '处理中...' : '智能处理'}
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              disabled={!userInput.trim() || isAnalyzing}
              onClick={analyzeProject}
            >
              <Brain className="h-4 w-4 mr-2" />
              项目分析
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}