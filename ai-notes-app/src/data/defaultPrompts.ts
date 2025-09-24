import { PromptTemplate } from '@/types/note';

export const defaultPromptTemplates: PromptTemplate[] = [
  {
    id: '1',
    name: '代码解释',
    content: '请详细解释以下代码的工作原理，包括：\n1. 代码的整体结构\n2. 关键函数和变量的作用\n3. 可能存在的问题或优化建议\n\n代码：\n```\n{code}\n```',
    category: '编程',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: '文章总结',
    content: '请阅读以下文章并提供：\n1. 文章的核心观点\n2. 主要论据和论证过程\n3. 关键结论\n4. 用一句话总结\n\n文章：\n{content}',
    category: '学习',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: '创意写作',
    content: '请根据以下主题创作一篇短文：\n\n主题：{topic}\n\n要求：\n- 字数在500字左右\n- 包含生动的细节描写\n- 有引人入胜的开头和结尾\n- 体现{style}风格',
    category: '创作',
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: '技术方案',
    content: '我需要解决以下技术问题：\n\n问题：{problem}\n\n约束条件：\n- {constraints}\n\n请提供：\n1. 问题的分析和理解\n2. 可行的解决方案\n3. 每种方案的优缺点\n4. 推荐方案及理由',
    category: '技术',
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    name: '学习建议',
    content: '我想学习{subject}，我的背景是{background}。\n\n请提供：\n1. 学习路径和阶段规划\n2. 推荐的学习资源\n3. 实践项目建议\n4. 常见误区提醒',
    category: '学习',
    createdAt: new Date().toISOString()
  }
];