# Project Alpha Frontend

前端应用使用 Vite + React + TypeScript + Tailwind CSS + Shadcn UI 构建。

## 技术栈

- **Vite**: 构建工具
- **React 19**: UI 框架
- **TypeScript**: 类型系统
- **Tailwind CSS**: 样式框架
- **Shadcn UI**: UI 组件库
- **Zustand**: 状态管理
- **Axios**: HTTP 客户端
- **Sonner**: Toast 通知
- **date-fns**: 日期处理

## 开发

### 安装依赖

```bash
yarn install
```

### 启动开发服务器

```bash
yarn dev
```

应用将在 `http://localhost:5173` 启动。

### 构建生产版本

```bash
yarn build
```

### 预览生产构建

```bash
yarn preview
```

## 项目结构

```
src/
├── components/          # React 组件
│   ├── common/         # 通用组件
│   ├── layout/         # 布局组件
│   ├── tickets/        # Ticket 相关组件
│   ├── tags/           # Tag 相关组件
│   └── ui/             # Shadcn UI 组件
├── lib/                # 工具函数和 API 客户端
├── store/              # Zustand 状态管理
├── types/              # TypeScript 类型定义
└── styles/             # 全局样式
```

## 功能特性

- ✅ Ticket CRUD 操作
- ✅ Tag 管理
- ✅ 搜索和过滤
- ✅ 状态管理（待完成/已完成）
- ✅ 响应式设计
- ✅ Toast 通知

## 环境要求

- Node.js >= 18
- Yarn >= 1.22

## 注意事项

确保后端 API 服务在 `http://localhost:8000` 运行，前端通过 Vite 代理访问 `/api` 路径。
