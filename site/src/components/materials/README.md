# Materials Components 使用指南

这些组件专门用于 MDX 材料页面，提供统一的设计风格和交互体验。

## 📦 可用组件

### 0. ExampleCode

显示可折叠的代码示例组件，默认显示前 5 行作为预览。

**Props:**
- `title`: 标题（可选，默认为 "Example Code"）
- `language`: 代码语言（可选，默认为 "markdown"）
- `code`: 代码内容（必填）
- `defaultExpanded`: 是否默认展开（可选，默认为 false）
- `showLineNumbers`: 是否显示行号（可选，默认为 true）
- `previewLines`: 预览行数（可选，默认为 5）

**特性:**
- ✅ 默认折叠，显示前 5 行预览
- ✅ 渐变遮罩效果，提示还有更多内容
- ✅ 显示总行数
- ✅ 点击展开查看完整代码
- ✅ 语法高亮（使用 Prism.js）
- ✅ 复制按钮（展开状态）
- ✅ 统一的设计令牌

**示例:**

```mdx
import ExampleCode from '../../components/materials/ExampleCode';

<ExampleCode
  title="完整 Constitution 示例 - constitution.md"
  language="markdown"
  code={`# Project Constitution

## Coding Standards
- Use TypeScript with strict mode
- Follow Airbnb style guide
- Maximum function length: 50 lines

## Architecture Principles
- Clean Architecture with dependency injection
- Domain-Driven Design for business logic
- Repository pattern for data access

## Testing Requirements
- Minimum 80% code coverage
- Unit tests for all business logic
- Integration tests for API endpoints`}
  client:load
/>
```

**自定义预览行数:**

```mdx
<ExampleCode
  title="短代码示例"
  language="typescript"
  code={longCode}
  previewLines={3}
  client:load
/>
```

---

### 1. LearningSuggestion

显示学习建议和延伸阅读链接的组件。

**Props:**
- `weeks`: 学习周次数组，每项包含 `week` 和 `description`
- `readings`: 延伸阅读链接数组，每项包含 `title`, `description`, `href`, `external`

**示例:**

```mdx
import LearningSuggestion from '../../components/materials/LearningSuggestion';

export const learningWeeks = [
  { week: 'Week 1-2', description: '使用 Claude Code，熟悉基本功能' },
  { week: 'Week 3', description: '深入理解架构（本文档）' },
  { week: 'Week 6', description: '学习 Agent 设计模式' },
  { week: 'Week 7', description: '掌握完整工作流' }
];

export const extendedReadings = [
  {
    title: '官方文档',
    description: 'claude.com/claude-code',
    href: 'https://claude.com/claude-code',
    external: true
  },
  {
    title: '工具对比',
    description: '与其他工具的对比',
    href: '/materials/ai-coding-tools-comparison',
    external: false
  }
];

<LearningSuggestion weeks={learningWeeks} readings={extendedReadings} client:load />
```

---

### 2. NextSteps

显示"下一步"推荐链接的组件。

**Props:**
- `title`: 标题文字（可选，默认为 "📚 下一步"）
- `links`: 链接数组，每项包含 `title`, `description`, `icon`, `href`, `external`

**示例:**

```mdx
import NextSteps from '../../components/materials/NextSteps';

export const nextStepLinks = [
  {
    title: '架构深度分析',
    description: '理解 Claude Code 内部原理',
    icon: '🏗️',
    href: '/materials/claude-code-architecture'
  },
  {
    title: '第 3 周课程',
    description: '深入学习 Claude Code',
    icon: '📖',
    href: '/curriculum/week-3'
  },
  {
    title: 'Claude Code 工具页',
    description: '查看功能和使用场景',
    icon: '🔧',
    href: '/tools/claude-code'
  }
];

<NextSteps links={nextStepLinks} client:load />
```

---

### 3. CallToAction

显示醒目的行动号召区块。

**Props:**
- `title`: 主标题文字（必填）
- `subtitle`: 副标题文字（可选）
- `gradient`: 背景渐变色（可选，默认为天蓝色渐变）

**示例:**

```mdx
import CallToAction from '../../components/materials/CallToAction';

<CallToAction
  title="准备好体验未来的编程方式了吗？"
  subtitle="下载 Cursor，开启你的 AI 编程之旅"
  client:load
/>
```

**自定义渐变色:**

```mdx
<CallToAction
  title="开始你的学习之旅"
  subtitle="立即加入训练营"
  gradient="linear-gradient(135deg, var(--md-sunbeam) 0%, var(--md-cream) 100%)"
  client:load
/>
```

---

## 🎨 设计特点

所有组件都遵循统一的设计系统：

- ✅ 使用 CSS 变量（design tokens）
- ✅ 响应式布局（自动适配移动端）
- ✅ 统一的悬停动画（右上移动 + 黑色阴影）
- ✅ 符合品牌视觉规范
- ✅ 优化的间距和字体大小

---

## 📝 注意事项

1. **必须添加 `client:load`**: 所有 React 组件在 Astro MDX 中使用时都需要添加 `client:load` 指令
2. **数据定义**: 建议在 MDX 文件中使用 `export const` 定义数据，保持代码清晰
3. **外部链接**: 使用 `external: true` 标记外部链接，组件会自动添加 `target="_blank"` 和 `rel="noopener noreferrer"`
4. **图标**: 推荐使用 emoji 作为图标，简单且跨平台兼容

---

## 🔄 迁移现有代码

如果你有旧的内联样式代码，可以按照以下步骤迁移：

### 旧代码（内联样式）:
```mdx
<div style={{ display: 'grid', gridTemplateColumns: '...', gap: '1rem' }}>
  <a href="..." style={{ padding: '1rem', background: '#f5f5f7', ... }}>
    <strong>标题</strong>
    <div style={{ fontSize: '0.85rem', ... }}>描述</div>
  </a>
</div>
```

### 新代码（使用组件）:
```mdx
import NextSteps from '../../components/materials/NextSteps';

export const links = [
  { title: '标题', description: '描述', icon: '📚', href: '...' }
];

<NextSteps links={links} client:load />
```

这样代码更简洁，维护更方便，样式也更统一！
