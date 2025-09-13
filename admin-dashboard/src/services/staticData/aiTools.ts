/**
 * AI工具静态数据
 */

import type { AITool, AIToolTag, AIToolStatistics } from '@/types/aiTools'

// AI工具标签数据
export const aiToolTags: AIToolTag[] = [
  {
    id: 1,
    name: '代码生成',
    createTime: '2024-01-15 10:00:00',
    toolCount: 3
  },
  {
    id: 2,
    name: '图像处理',
    createTime: '2024-02-20 14:30:00',
    toolCount: 2
  },
  {
    id: 3,
    name: '文本分析',
    createTime: '2024-03-10 09:15:00',
    toolCount: 2
  },
  {
    id: 4,
    name: '数据可视化',
    createTime: '2024-04-05 16:45:00',
    toolCount: 1
  },
  {
    id: 5,
    name: '语音识别',
    createTime: '2024-05-12 11:20:00',
    toolCount: 1
  }
]

// AI工具数据
export const aiTools: AITool[] = [
  {
    id: 1,
    logo: '/images/ai-tools/code-generator.png',
    name: '智能代码生成器',
    tagId: 1,
    tag: aiToolTags[0],
    description: '基于自然语言描述自动生成代码，支持多种编程语言',
    url: 'https://example.com/code-generator',
    status: 'enabled',
    creatorId: 1,
    creator: '系统管理员',
    createTime: '2024-01-15 10:30:00',
    caseCount: 15
  },
  {
    id: 2,
    logo: '/images/ai-tools/image-editor.png',
    name: 'AI图像编辑器',
    tagId: 2,
    tag: aiToolTags[1],
    description: '智能图像处理工具，支持自动修复、风格转换等功能',
    url: 'https://example.com/image-editor',
    status: 'enabled',
    creatorId: 2,
    creator: '技术部',
    createTime: '2024-02-22 15:45:00',
    caseCount: 8
  },
  {
    id: 3,
    logo: '/images/ai-tools/text-analyzer.png',
    name: '文本情感分析器',
    tagId: 3,
    tag: aiToolTags[2],
    description: '分析文本情感倾向，支持多语言文本处理',
    url: 'https://example.com/text-analyzer',
    status: 'enabled',
    creatorId: 3,
    creator: '产品部',
    createTime: '2024-03-12 13:20:00',
    caseCount: 12
  },
  {
    id: 4,
    logo: '/images/ai-tools/data-viz.png',
    name: '数据可视化平台',
    tagId: 4,
    tag: aiToolTags[3],
    description: '将复杂数据转换为直观的图表和可视化报告',
    url: 'https://example.com/data-viz',
    status: 'enabled',
    creatorId: 1,
    creator: '系统管理员',
    createTime: '2024-04-08 17:10:00',
    caseCount: 6
  },
  {
    id: 5,
    logo: '/images/ai-tools/voice-recognition.png',
    name: '语音识别工具',
    tagId: 5,
    tag: aiToolTags[4],
    description: '高精度语音转文字工具，支持多种语言和方言',
    url: 'https://example.com/voice-recognition',
    status: 'disabled',
    creatorId: 2,
    creator: '技术部',
    createTime: '2024-05-15 10:00:00',
    caseCount: 3
  },
  {
    id: 6,
    logo: '/images/ai-tools/code-review.png',
    name: '智能代码审查',
    tagId: 1,
    tag: aiToolTags[0],
    description: '自动代码审查工具，检测潜在问题和安全漏洞',
    url: 'https://example.com/code-review',
    status: 'enabled',
    creatorId: 1,
    creator: '系统管理员',
    createTime: '2024-01-20 14:15:00',
    caseCount: 9
  },
  {
    id: 7,
    logo: '/images/ai-tools/image-generator.png',
    name: 'AI图像生成器',
    tagId: 2,
    tag: aiToolTags[1],
    description: '根据文本描述生成高质量图像',
    url: 'https://example.com/image-generator',
    status: 'enabled',
    creatorId: 3,
    creator: '产品部',
    createTime: '2024-02-28 11:30:00',
    caseCount: 11
  },
  {
    id: 8,
    logo: '/images/ai-tools/nlp-toolkit.png',
    name: '自然语言处理工具包',
    tagId: 3,
    tag: aiToolTags[2],
    description: '提供文本分类、关键词提取、摘要生成等功能',
    url: 'https://example.com/nlp-toolkit',
    status: 'enabled',
    creatorId: 2,
    creator: '技术部',
    createTime: '2024-03-18 16:45:00',
    caseCount: 7
  }
]

// 添加调试日志
console.log('AI Tools static data loaded:', { aiTools, aiToolTags })

// AI工具统计数据
export const aiToolStatistics: AIToolStatistics = {
  totalTools: aiTools.length,
  enabledTools: aiTools.filter(tool => tool.status === 'enabled').length,
  disabledTools: aiTools.filter(tool => tool.status === 'disabled').length,
  totalTags: aiToolTags.length,
  todayNewTools: 0,
  weeklyNewTools: 2,
  monthlyNewTools: 5,
  popularTags: [
    { tagId: 1, tagName: '代码生成', toolCount: 2 },
    { tagId: 2, tagName: '图像处理', toolCount: 2 },
    { tagId: 3, tagName: '文本分析', toolCount: 2 }
  ],
  recentTools: aiTools.slice(0, 3)
}