import React, { useState, useEffect } from 'react';
import { X, Brain, Lightbulb, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Project, ProjectTask } from '../types/project';
import { motion, AnimatePresence } from 'framer-motion';

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  tasks: ProjectTask[];
}

interface AIInsight {
  id: string;
  type: 'optimization' | 'risk' | 'suggestion' | 'trend';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  actionable: boolean;
}

const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({
  isOpen,
  onClose,
  project,
  tasks: initialTasks
}) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (isOpen && project) {
      performAIAnalysis();
    }
  }, [isOpen, project]);

  const performAIAnalysis = async () => {
    setIsAnalyzing(true);
    
    // 模拟AI分析过程
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 生成模拟的AI洞察
    const mockInsights: AIInsight[] = [
      {
        id: '1',
        type: 'optimization',
        title: '任务优先级优化',
        description: '建议重新调整3个高优先级任务的执行顺序，可提升整体效率25%',
        priority: 'high',
        confidence: 85,
        actionable: true
      },
      {
        id: '2',
        type: 'risk',
        title: '截止日期风险',
        description: '检测到2个任务可能无法按时完成，建议提前调整资源分配',
        priority: 'high',
        confidence: 92,
        actionable: true
      },
      {
        id: '3',
        type: 'suggestion',
        title: '协作效率提升',
        description: '基于任务依赖关系分析，建议创建2个并行工作流程',
        priority: 'medium',
        confidence: 78,
        actionable: true
      },
      {
        id: '4',
        type: 'trend',
        title: '项目进度趋势',
        description: '当前进度良好，预计可提前3天完成，建议考虑增加功能范围',
        priority: 'low',
        confidence: 71,
        actionable: false
      }
    ];
    
    setInsights(mockInsights);
    setIsAnalyzing(false);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'optimization': return <TrendingUp className="h-5 w-5" />;
      case 'risk': return <AlertTriangle className="h-5 w-5" />;
      case 'suggestion': return <Lightbulb className="h-5 w-5" />;
      case 'trend': return <Clock className="h-5 w-5" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'optimization': return 'text-blue-600 bg-blue-50';
      case 'risk': return 'text-red-600 bg-red-50';
      case 'suggestion': return 'text-green-600 bg-green-50';
      case 'trend': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  AI 项目分析
                </h2>
                <p className="text-sm text-gray-600">
                  {project?.name} - 智能洞察与建议
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-white/50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* 内容区域 */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                <p className="text-gray-600 text-lg">AI 正在分析项目数据...</p>
                <p className="text-gray-500 text-sm mt-2">这可能需要几秒钟时间</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 项目概览 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">项目概览</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">总任务数</span>
                      <p className="font-medium">{initialTasks.length}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">已完成</span>
                      <p className="font-medium text-green-600">
                        {initialTasks.filter(t => t.status === 'completed').length}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">进行中</span>
                      <p className="font-medium text-blue-600">
                        {initialTasks.filter(t => t.status === 'in_progress').length}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">待开始</span>
                      <p className="font-medium text-gray-600">
                        {initialTasks.filter(t => t.status === 'todo').length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI 洞察 */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    AI 智能洞察
                  </h3>
                  <div className="space-y-4">
                    {insights.map((insight) => (
                      <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${getInsightColor(insight.type)}`}>
                            {getInsightIcon(insight.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-gray-900">
                                {insight.title}
                              </h4>
                              <Badge className={getPriorityColor(insight.priority)}>
                                {insight.priority === 'high' ? '高优先级' : 
                                 insight.priority === 'medium' ? '中优先级' : '低优先级'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {insight.confidence}% 置信度
                              </Badge>
                            </div>
                            <p className="text-gray-600 text-sm mb-3">
                              {insight.description}
                            </p>
                            {insight.actionable && (
                              <Button size="sm" variant="outline">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                应用建议
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 底部操作栏 */}
          <div className="flex items-center justify-between p-6 border-t bg-gray-50">
            <p className="text-sm text-gray-500">
              分析完成时间: {new Date().toLocaleString()}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                关闭
              </Button>
              <Button onClick={() => performAIAnalysis()} disabled={isAnalyzing}>
                重新分析
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIAnalysisModal;