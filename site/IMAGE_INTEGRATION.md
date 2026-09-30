# 图片集成总结

## 生成的图片

所有图片均使用 Ghibli（吉卜力工作室）风格生成，营造温馨、梦幻的氛围。

### 1. Hero 背景图
- **位置**: `/images/hero/hero-bg.png`
- **尺寸**: 1536x1024 (横向)
- **描述**: 温馨的编程工作空间，带有浮动的全息屏幕和魔法 AI 精灵
- **使用位置**: 首页 Hero 区域背景

### 2. 讲师头像
- **位置**: `/images/instructor/chen-tian.png`
- **尺寸**: 1024x1024 (方形)
- **描述**: 智慧友善的技术讲师在宁静的书房中
- **使用位置**: 关于页面讲师介绍部分

### 3. 工具图片 (6张)
所有工具图片尺寸均为 1024x1024 (方形)

#### 编辑器类
- **Cursor** (`/images/tools/cursor.png`): 魔法代码编辑器界面，AI 精灵协助编码
- **Claude Code** (`/images/tools/claude-code.png`): 自主 AI Agent 在多个屏幕上工作

#### 知识管理
- **NotebookLM** (`/images/tools/notebooklm.png`): 魔法图书馆，AI 精灵整理知识

#### 协议
- **MCP** (`/images/tools/mcp.png`): 抽象网络协议可视化，数据流连接系统

#### 模型
- **Claude** (`/images/tools/claude.png`): 智慧 AI 大脑实体，神经连接发光
- **GPT-4** (`/images/tools/gpt-4.png`): 强大的 AI 意识，多形态能力展示

## 代码修改

### 1. Hero 组件 (`src/components/ui/Hero.tsx`)
- 添加 `backgroundImage` prop
- 支持背景图片与渐变叠加效果

### 2. 首页 (`src/pages/index.astro`)
- Hero 组件传入 `backgroundImage="/images/hero/hero-bg.png"`

### 3. 关于页面 (`src/pages/about.astro`)
- 讲师头像从渐变圆形改为实际图片
- 使用 `/images/instructor/chen-tian.png`

### 4. ToolShowcase 组件 (`src/components/tools/ToolShowcase.tsx`)
- 添加 `imageUrl` prop
- 支持显示工具图片或回退到首字母显示

### 5. 工具页面 (`src/pages/tools/index.astro`)
- 所有 ToolShowcase 组件传入 `imageUrl={/images/tools/${tool.id}.png}`
- 覆盖编辑器、模型、协议、知识管理四大类别

## 效果预览

所有图片都已集成到网站中，可以通过以下页面查看：
- 首页: Hero 背景图
- 关于页面: 讲师头像
- 工具页面: 6 个工具的 Ghibli 风格插图

## 未来扩展

项目预览图暂时保留为占位符，待实际项目完成后可以使用真实截图替换。
