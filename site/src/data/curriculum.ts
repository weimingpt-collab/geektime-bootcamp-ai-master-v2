export interface WeekData {
  weekNumber: number;
  title: string;
  subtitle: string;
  objectives: string[];
  keyPoints: {
    title: string;
    description: string;
    diagram?: string;
  }[];
  practicalContent: string[];
  relatedTools: string[];
  relatedProjects: string[];
  estimatedHours: number;
}

export const weeks: WeekData[] = [
  {
    weekNumber: 1,
    title: 'AI 编码新范式',
    subtitle: '工具启蒙与快速实践',
    objectives: [
      '认知工具全貌：建立对 AI 辅助工具生态的初步认知',
      '掌握核心基础：了解主流大语言模型的核心能力',
      '零基础快速上手：完成工具安装配置',
      '完成首个 AI 项目：构建项目管理工具原型',
    ],
    keyPoints: [
      {
        title: 'AI 辅助工具生态概览',
        description: '了解 AI 原生代码编辑器、知识管理工具和协议的全貌',
        diagram: `graph LR
    A[AI工具生态] --> B[代码编辑器]
    A --> C[知识管理]
    A --> D[协议与API]
    B --> E[Cursor]
    B --> F[Claude Code]
    C --> G[NotebookLM]
    D --> H[MCP]
    D --> I[大模型API]`,
      },
      {
        title: '主流大语言模型初探',
        description: '认识 GPT-4、Claude、Gemini 等主流模型的特点与应用场景',
      },
      {
        title: 'AI 工具环境搭建',
        description: '配置开发环境，安装必要的 AI 工具和插件',
      },
      {
        title: '项目原型实践',
        description: '使用 AI 工具快速构建第一个实用项目',
      },
    ],
    practicalContent: [
      '安装和配置 Cursor 编辑器',
      '配置 AI API 密钥（OpenAI/Anthropic）',
      '学习基本的 Prompt Engineering 技巧',
      '创建第一个 AI 辅助项目：项目管理工具',
    ],
    relatedTools: ['Cursor', 'Claude', 'GPT-4'],
    relatedProjects: ['project-1'],
    estimatedHours: 8,
  },
  {
    weekNumber: 2,
    title: '深入 Cursor',
    subtitle: '人机交互式智能编程',
    objectives: [
      '掌握 Cursor 核心功能：Tab 补全、Chat、Composer',
      '理解上下文管理：@符号系统的使用',
      '学习 Rules 定制：打造个性化 AI 助手',
      '实践多文件协同编辑',
    ],
    keyPoints: [
      {
        title: 'Cursor 核心功能详解',
        description: 'Tab 自动补全、Chat 对话模式、Composer 多文件编辑的深度使用',
        diagram: `graph TB
    A[Cursor 核心功能] --> B[Tab 补全]
    A --> C[Chat 对话]
    A --> D[Composer 编辑]
    B --> E[智能代码建议]
    C --> F[上下文对话]
    D --> G[多文件协同]`,
      },
      {
        title: '上下文管理系统',
        description: '使用 @file、@folder、@code、@docs 精确控制 AI 的上下文范围',
      },
      {
        title: 'Rules 定制化',
        description: '创建项目级和全局 Rules，定制 AI 的行为和输出风格',
      },
      {
        title: '实战技巧',
        description: 'Cursor 在实际项目中的高效使用模式',
      },
    ],
    practicalContent: [
      '使用 Tab 补全编写完整的函数和组件',
      '通过 Chat 模式重构现有代码',
      '使用 Composer 实现跨文件的功能开发',
      '创建自定义 Rules 文件',
    ],
    relatedTools: ['Cursor'],
    relatedProjects: ['project-2'],
    estimatedHours: 10,
  },
  {
    weekNumber: 3,
    title: '深入 Claude Code',
    subtitle: 'Agent 驱动的自动化开发',
    objectives: [
      '理解 Agent 架构：Claude Code 的工作原理',
      '掌握任务分解：如何有效地下达开发任务',
      '学习文件操作：Read、Edit、Write 的使用场景',
      '实践 Tree-sitter：代码结构理解',
    ],
    keyPoints: [
      {
        title: 'Claude Code Agent 架构',
        description: '理解 Claude Code 的 Agent 系统、工具调用机制',
        diagram: `graph TB
    A[Claude Code] --> B[Task 规划]
    B --> C[工具调用]
    C --> D[Read 文件]
    C --> E[Edit 代码]
    C --> F[Write 新文件]
    C --> G[Bash 执行]
    D --> H[代码分析]
    E --> H
    F --> H
    G --> H
    H --> I[输出结果]`,
      },
      {
        title: '任务分解艺术',
        description: '如何将复杂需求分解为 Claude Code 可执行的子任务',
      },
      {
        title: 'Tree-sitter 代码理解',
        description: '利用 Tree-sitter 进行精确的代码结构分析和编辑',
      },
      {
        title: '自动化工作流',
        description: '使用 Claude Code 实现端到端的开发自动化',
      },
    ],
    practicalContent: [
      '使用 Claude Code 分析现有项目结构',
      '通过自然语言描述实现新功能',
      '让 Claude Code 重构代码并优化性能',
      '实践自动化测试编写',
    ],
    relatedTools: ['Claude Code', 'Tree-sitter'],
    relatedProjects: ['project-2'],
    estimatedHours: 10,
  },
  {
    weekNumber: 4,
    title: '代码库理解与文档化',
    subtitle: '让 AI 成为你的代码助手',
    objectives: [
      '学习代码库索引：构建高效的代码检索系统',
      '掌握文档生成：自动化 README 和 API 文档',
      '实践代码审查：使用 AI 进行 Code Review',
      '理解架构分析：从代码到系统架构图',
    ],
    keyPoints: [
      {
        title: '代码库索引技术',
        description: '使用向量数据库和语义搜索理解大型代码库',
      },
      {
        title: 'NotebookLM 深度应用',
        description: '利用 NotebookLM 管理项目知识和文档',
      },
      {
        title: '自动文档生成',
        description: '使用 AI 生成高质量的技术文档和注释',
      },
      {
        title: '代码质量提升',
        description: 'AI 辅助的代码审查和重构建议',
      },
    ],
    practicalContent: [
      '为现有项目生成完整的 README 文档',
      '使用 NotebookLM 整理项目知识库',
      '实现自动化 Code Review 流程',
      '生成项目架构图和 API 文档',
    ],
    relatedTools: ['NotebookLM', 'Cursor', 'Claude Code'],
    relatedProjects: ['project-3'],
    estimatedHours: 8,
  },
  {
    weekNumber: 5,
    title: '深入 MCP',
    subtitle: 'Model Context Protocol 实践',
    objectives: [
      '理解 MCP 架构：Server、Client、Protocol',
      '掌握 MCP Server 开发：Resources、Tools、Prompts',
      '学习 MCP 集成：与现有工具的整合',
      '实践自定义 MCP Server',
    ],
    keyPoints: [
      {
        title: 'MCP 协议详解',
        description: 'Model Context Protocol 的设计理念和核心概念',
        diagram: `graph LR
    A[MCP Client] <--> B[MCP Protocol]
    B <--> C[MCP Server]
    C --> D[Resources]
    C --> E[Tools]
    C --> F[Prompts]
    D --> G[数据源]
    E --> H[功能接口]
    F --> I[提示词模板]`,
      },
      {
        title: 'MCP Server 开发',
        description: '使用 Python 或 TypeScript 开发自定义 MCP Server',
      },
      {
        title: 'Resources vs Tools vs Prompts',
        description: '理解三种 MCP 能力的使用场景和最佳实践',
      },
      {
        title: 'MCP 生态系统',
        description: '探索现有的 MCP Server 和集成方案',
      },
    ],
    practicalContent: [
      '搭建第一个 MCP Server',
      '实现自定义 Resources 提供数据',
      '创建 Tools 扩展 AI 能力',
      '编写 Prompts 模板',
      '将 MCP Server 集成到 Claude Desktop',
    ],
    relatedTools: ['MCP', 'Claude Desktop'],
    relatedProjects: ['project-3'],
    estimatedHours: 12,
  },
  {
    weekNumber: 6,
    title: 'Agent 核心',
    subtitle: '构建智能 Agent 系统',
    objectives: [
      '理解 Agent 设计模式：ReAct、Plan & Execute',
      '掌握工具调用：Function Calling 的实现',
      '学习 Agent 框架：LangChain、AutoGPT 等',
      '实践多 Agent 协作',
    ],
    keyPoints: [
      {
        title: 'Agent 设计模式',
        description: 'ReAct、Chain of Thought、Plan & Execute 等核心模式',
        diagram: `graph TB
    A[Agent 输入] --> B[思考 Reasoning]
    B --> C[行动 Action]
    C --> D[观察 Observation]
    D --> B
    B --> E{任务完成?}
    E -->|否| C
    E -->|是| F[输出结果]`,
      },
      {
        title: 'Function Calling',
        description: '实现 AI 与外部工具的交互',
      },
      {
        title: 'Agent 框架对比',
        description: 'LangChain、LlamaIndex、AutoGPT 的特点与选择',
      },
      {
        title: '多 Agent 系统',
        description: '设计和实现多个 Agent 的协作机制',
      },
    ],
    practicalContent: [
      '实现一个基于 ReAct 的 Agent',
      '使用 Function Calling 集成外部 API',
      '开发 Code Review Agent',
      '构建多 Agent 协作系统',
    ],
    relatedTools: ['LangChain', 'Claude API', 'OpenAI API'],
    relatedProjects: ['project-4'],
    estimatedHours: 12,
  },
  {
    weekNumber: 7,
    title: '全流程实践',
    subtitle: '端到端 AI 辅助开发',
    objectives: [
      '整合所有工具：Cursor + Claude Code + MCP',
      '实践完整开发流程：需求 → 设计 → 开发 → 测试 → 部署',
      '学习最佳实践：代码质量、安全性、性能',
      '构建个人工作流',
    ],
    keyPoints: [
      {
        title: '端到端开发流程',
        description: '从需求分析到部署上线的完整 AI 辅助流程',
        diagram: `graph LR
    A[需求分析] --> B[架构设计]
    B --> C[代码开发]
    C --> D[测试验证]
    D --> E[部署上线]
    A -.-> F[Claude Code]
    B -.-> G[Cursor]
    C -.-> G
    C -.-> F
    D -.-> H[AI Testing]
    E -.-> I[CI/CD]`,
      },
      {
        title: '工具链整合',
        description: 'Cursor、Claude Code、MCP 的最佳组合使用',
      },
      {
        title: '代码质量保障',
        description: 'AI 辅助的代码审查、测试和重构',
      },
      {
        title: '个性化工作流',
        description: '根据项目特点定制自己的 AI 辅助开发流程',
      },
    ],
    practicalContent: [
      '使用 Cursor 快速原型开发',
      '通过 Claude Code 实现复杂功能',
      '集成 MCP Server 扩展能力',
      '实施 AI 辅助的 Code Review',
      '自动化测试用例生成',
      '完成完整项目交付',
    ],
    relatedTools: ['Cursor', 'Claude Code', 'MCP', 'GitHub'],
    relatedProjects: ['project-5'],
    estimatedHours: 16,
  },
  {
    weekNumber: 8,
    title: '回顾与展望',
    subtitle: '总结经验，拥抱未来',
    objectives: [
      '回顾8周学习成果',
      '总结个人最佳实践',
      '探索前沿技术：多模态、Agent 进化',
      '规划持续学习路径',
    ],
    keyPoints: [
      {
        title: '学习成果总结',
        description: '系统回顾掌握的工具、技能和项目经验',
      },
      {
        title: '最佳实践提炼',
        description: '整理个人化的 AI 辅助编程方法论',
      },
      {
        title: 'AI 技术前沿',
        description: '探索多模态 AI、Agent 进化、新兴工具',
      },
      {
        title: '持续学习计划',
        description: '制定未来的学习和实践路线图',
      },
    ],
    practicalContent: [
      '完成课程总结报告',
      '分享个人项目和经验',
      '参与社区讨论',
      '制定3个月行动计划',
    ],
    relatedTools: ['All Tools'],
    relatedProjects: [],
    estimatedHours: 4,
  },
];

// 获取时间线数据
export const getTimelineData = () => {
  return weeks.map((week) => ({
    weekNumber: week.weekNumber,
    title: week.title,
    subtitle: week.subtitle,
  }));
};

// 根据周数获取课程数据
export const getWeekData = (weekNumber: number): WeekData | undefined => {
  return weeks.find((week) => week.weekNumber === weekNumber);
};
