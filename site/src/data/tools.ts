export interface ToolData {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: 'editor' | 'knowledge' | 'protocol' | 'model';
  features: {
    icon: string;
    title: string;
    description: string;
  }[];
  architecture?: string;
  usageInCourse: {
    weekNumber: number;
    role: string;
  }[];
  officialWebsite: string;
  demoVideo?: string;
}

export const tools: ToolData[] = [
  {
    id: 'cursor',
    name: 'Cursor 2.0',
    tagline: 'AI 原生代码编辑器 (2025年10月发布)',
    description:
      '基于 VS Code 深度定制的 AI 原生编辑器，搭载定制 Composer 模型（比同等智能模型快4倍）。支持多Agent并行、浏览器集成、语音控制，让 AI 成为你的编程搭档。',
    category: 'editor',
    features: [
      {
        icon: '🤖',
        title: 'Composer 定制模型',
        description: '专为编码优化的前沿模型，4倍速度提升，大多数任务30秒内完成',
      },
      {
        icon: '🔀',
        title: '多Agent并行 (最多8个)',
        description: '同时运行8个Agent，使用git worktrees避免文件冲突',
      },
      {
        icon: '🌐',
        title: '浏览器集成',
        description: '内嵌浏览器，选择元素并将DOM信息传递给Agent',
      },
      {
        icon: '🎤',
        title: '语音控制',
        description: '内置语音转文本，自定义语音关键词触发Agent',
      },
      {
        icon: '🔒',
        title: '安全沙箱',
        description: 'macOS沙箱环境，仅限工作区读写，无网络访问',
      },
    ],
    architecture: `graph TB
    A[用户输入] --> B[上下文收集]
    B --> C[@file/@folder/@code/@docs]
    C --> D[AI 引擎]
    D --> E[代码生成]
    D --> F[代码补全]
    D --> G[代码重构]
    E --> H[编辑器]
    F --> H
    G --> H`,
    usageInCourse: [
      { weekNumber: 1, role: '基础配置与入门' },
      { weekNumber: 2, role: '核心功能深度学习' },
      { weekNumber: 4, role: '代码库理解' },
      { weekNumber: 7, role: '全流程实践' },
    ],
    officialWebsite: 'https://cursor.sh',
  },
  {
    id: 'claude-code',
    name: 'Claude Code 2.0',
    tagline: 'Agent 驱动的自动化开发 (2025年9月发布)',
    description:
      'Anthropic 官方开发工具，基于 Sonnet 4.5 驱动。支持 VS Code 扩展、检查点回滚、子Agent并行、Web/移动端，安全沙箱减少84%权限提示。',
    category: 'editor',
    features: [
      {
        icon: '🔌',
        title: 'VS Code 原生扩展',
        description: '专属侧边栏实时显示 Claude 的更改，内联差异对比',
      },
      {
        icon: '⏮️',
        title: '检查点与回滚',
        description: '自动保存代码状态，Esc两次或/rewind命令即可回退',
      },
      {
        icon: '🤖',
        title: '子Agent与Hooks',
        description: 'Subagents并行处理任务，Hooks自动触发测试等操作',
      },
      {
        icon: '🌐',
        title: 'Web与移动端',
        description: '浏览器和移动设备上管理多个AI编码Agent（Pro/Max订阅）',
      },
      {
        icon: '🔒',
        title: '安全沙箱',
        description: '文件系统和网络隔离，权限提示减少84%',
      },
    ],
    architecture: `graph TB
    A[自然语言需求] --> B[Task 规划]
    B --> C[工具选择]
    C --> D[Read 分析]
    C --> E[Edit 修改]
    C --> F[Write 创建]
    C --> G[Bash 执行]
    D --> H[代码理解]
    E --> H
    F --> H
    G --> H
    H --> I[反馈调整]
    I --> J{任务完成?}
    J -->|否| B
    J -->|是| K[输出结果]`,
    usageInCourse: [
      { weekNumber: 1, role: '初步认识' },
      { weekNumber: 3, role: '核心功能深度学习' },
      { weekNumber: 6, role: 'Agent 架构理解' },
      { weekNumber: 7, role: '全流程实践' },
    ],
    officialWebsite: 'https://claude.com/claude-code',
  },
  {
    id: 'notebooklm',
    name: 'NotebookLM',
    tagline: '智能知识管理助手 (2025年更新)',
    description:
      'Google 推出的 AI 知识管理工具，基于 Gemini 1M token 上下文窗口。支持闪卡、测验、思维导图、视频概览，对话质量提升50%，是学习和研究的强大助手。',
    category: 'knowledge',
    features: [
      {
        icon: '🧠',
        title: '1M Token 上下文',
        description: '基于 Gemini，8倍扩展上下文窗口，6倍延长对话记忆',
      },
      {
        icon: '📝',
        title: '闪卡与测验',
        description: '从文档自动生成闪卡和测验，强化学习效果',
      },
      {
        icon: '🗺️',
        title: '思维导图',
        description: '交互式思维导图，探索复杂主题和连接',
      },
      {
        icon: '🎬',
        title: '视频/音频概览',
        description: '多种格式（Brief/Critique/Debate）音视频概览',
      },
      {
        icon: '📚',
        title: '学习指南',
        description: '定制化报告和学习指南，深化理解',
      },
    ],
    usageInCourse: [
      { weekNumber: 1, role: '课程资料管理' },
      { weekNumber: 4, role: '代码库文档化' },
      { weekNumber: 8, role: '学习笔记整理' },
    ],
    officialWebsite: 'https://notebooklm.google',
  },
  {
    id: 'mcp',
    name: 'MCP 0.2',
    tagline: 'Model Context Protocol (2025年3月更新)',
    description:
      'Anthropic 推出的开放协议标准，OpenAI、Google、Microsoft 已全面采用。支持 OAuth 2.1、流式传输、代码执行模式，token 使用降低98.7%。',
    category: 'protocol',
    features: [
      {
        icon: '🔐',
        title: 'OAuth 2.1 安全',
        description: '保护 agent-server 通信，细粒度权限控制',
      },
      {
        icon: '⚡',
        title: '流式 HTTP 传输',
        description: '保持连接开放，实时双向数据流',
      },
      {
        icon: '💻',
        title: '代码执行模式',
        description: 'MCP工具转为代码级API，效率提升98.7%',
      },
      {
        icon: '🌍',
        title: '行业广泛采用',
        description: 'OpenAI、Google、Microsoft 2025年全面支持',
      },
      {
        icon: '🔧',
        title: 'Resources/Tools/Prompts',
        description: '数据源、工具调用、提示词模板三位一体',
      },
    ],
    architecture: `graph LR
    A[MCP Client<br/>Claude Desktop] <-->|MCP Protocol| B[MCP Server]
    B --> C[Resources<br/>数据源]
    B --> D[Tools<br/>功能接口]
    B --> E[Prompts<br/>模板]
    C --> F[Database]
    C --> G[File System]
    C --> H[API]
    D --> I[Search]
    D --> J[Execute]
    D --> K[Custom Tools]`,
    usageInCourse: [
      { weekNumber: 1, role: 'MCP 概念认知' },
      { weekNumber: 5, role: 'MCP 深度学习与开发' },
      { weekNumber: 7, role: 'MCP Server 集成' },
    ],
    officialWebsite: 'https://modelcontextprotocol.io',
  },
  {
    id: 'claude',
    name: 'Claude Sonnet 4.5',
    tagline: '最智能的AI模型 (2025年9月)',
    description:
      'Anthropic 最先进模型，标准200K上下文（企业500K，API 1M）。64K输出token，在编码和复杂Agent任务中表现最佳。驱动 Claude Code 2.0 和 Cursor 2.0。',
    category: 'model',
    features: [
      {
        icon: '🧠',
        title: '超强推理能力',
        description: 'Anthropic 最智能模型，博士级专家能力',
      },
      {
        icon: '📖',
        title: '1M Token 上下文',
        description: '标准200K，企业500K，API beta 1M token',
      },
      {
        icon: '📤',
        title: '64K 输出',
        description: '支持64K token输出，适合复杂代码生成',
      },
      {
        icon: '💰',
        title: '高性价比',
        description: '$3/M输入 $15/M输出，支持prompt缓存和批处理',
      },
      {
        icon: '💻',
        title: '编码最佳',
        description: '在编码和Agent任务中表现最优',
      },
    ],
    usageInCourse: [
      { weekNumber: 1, role: 'AI 能力认知' },
      { weekNumber: 3, role: 'Claude Code 底层模型' },
      { weekNumber: 6, role: 'Agent 系统核心' },
    ],
    officialWebsite: 'https://claude.ai',
  },
  {
    id: 'gpt-4',
    name: 'GPT-4.1 / GPT-5',
    tagline: 'OpenAI 2025旗舰系列',
    description:
      'GPT-4.1 系列（2025年4月）支持1M上下文，比GPT-4o便宜26%。GPT-5（2025年8月）是最先进模型，Sam Altman称"PhD级专家在你口袋里"。',
    category: 'model',
    features: [
      {
        icon: '📖',
        title: '1M Token 上下文',
        description: 'GPT-4.1 支持1M token，处理超大文档',
      },
      {
        icon: '💰',
        title: '更具性价比',
        description: 'GPT-4.1比4o便宜26%，prompt缓存75%折扣',
      },
      {
        icon: '🧠',
        title: 'GPT-5 最强推理',
        description: '2025年8月发布，博士级AI专家',
      },
      {
        icon: '🎨',
        title: 'GPT-image-1',
        description: '最新图像生成模型，文本渲染大幅改进',
      },
      {
        icon: '⚙️',
        title: '推理模型 o4/o3',
        description: 'o4-mini和o3提供增强推理和质量',
      },
    ],
    usageInCourse: [
      { weekNumber: 1, role: 'AI 能力认知' },
      { weekNumber: 2, role: 'Cursor 可选模型' },
      { weekNumber: 6, role: 'Function Calling 实践' },
    ],
    officialWebsite: 'https://openai.com/gpt-4',
  },
];

// 按类别获取工具
export const getToolsByCategory = (
  category: ToolData['category']
): ToolData[] => {
  return tools.filter((tool) => tool.category === category);
};

// 根据 ID 获取工具
export const getToolById = (id: string): ToolData | undefined => {
  return tools.find((tool) => tool.id === id);
};

// 获取在特定周使用的工具
export const getToolsByWeek = (weekNumber: number): ToolData[] => {
  return tools.filter((tool) =>
    tool.usageInCourse.some((usage) => usage.weekNumber === weekNumber)
  );
};
