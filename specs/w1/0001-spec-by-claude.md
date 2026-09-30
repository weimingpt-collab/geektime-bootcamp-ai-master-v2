# Ticket 管理工具 - 需求与设计文档

## 1. 项目概述

### 1.1 项目目标
构建一个简洁高效的基于标签的 Ticket 管理工具,帮助用户通过灵活的标签系统组织和跟踪任务。

### 1.2 核心价值
- 简单直观的任务管理
- 灵活的标签分类系统
- 快速的搜索和筛选能力
- 零配置的单用户体验

### 1.3 技术选型

**后端技术栈:**
- FastAPI - 高性能的 Python Web 框架
- PostgreSQL - 关系型数据库
- SQLAlchemy - ORM 框架
- Pydantic - 数据验证

**前端技术栈:**
- TypeScript - 类型安全的 JavaScript
- Vite - 现代化构建工具
- React - UI 组件库
- Tailwind CSS - 原子化 CSS 框架
- Shadcn - 高质量 React 组件库

---

## 2. 核心功能需求

### 2.1 Ticket 生命周期管理

#### 2.1.1 创建 Ticket
**功能描述:** 用户可以创建新的工作项/任务

**必填字段:**
- 标题 (title): 文本,1-200 字符

**可选字段:**
- 描述 (description): 长文本,最多 5000 字符
- 标签列表: 可以在创建时选择已有标签或创建新标签

**默认行为:**
- 新建 Ticket 自动设为"未完成"状态
- 记录创建时间
- 如果没有选择标签,可以稍后添加

**验证规则:**
- 标题不能为空
- 标题不能只包含空白字符
- 描述长度限制

#### 2.1.2 编辑 Ticket
**功能描述:** 修改已存在的 Ticket 信息

**可编辑内容:**
- 标题
- 描述

**行为:**
- 更新"最后修改时间"
- 保持原有的完成状态
- 保持原有的标签关联

**限制:**
- 标题仍然不能为空
- 遵守创建时的验证规则

#### 2.1.3 删除 Ticket
**功能描述:** 永久删除 Ticket

**行为:**
- 从数据库中彻底移除
- 自动解除与所有标签的关联
- 不可恢复(无回收站)

**安全措施:**
- 需要用户二次确认

#### 2.1.4 标记完成/取消完成
**功能描述:** 在"未完成"和"已完成"两种状态之间切换

**完成操作:**
- 状态从"未完成"变为"已完成"
- 记录完成时间
- 在列表中可以有视觉区分(如变灰、删除线等)

**取消完成操作:**
- 状态从"已完成"变回"未完成"
- 清除完成时间
- 恢复正常显示样式

**快捷操作:**
- 支持一键切换状态
- 在列表视图中快速操作

### 2.2 标签管理

#### 2.2.1 标签的作用
- 作为分类维度,一个 Ticket 可以有多个标签
- 例如: 一个 Ticket 可以同时有 "前端"、"紧急"、"Bug" 三个标签
- 标签可以跨 Ticket 重复使用

#### 2.2.2 为 Ticket 添加标签
**功能描述:** 将一个或多个标签关联到 Ticket

**方式一: 选择已有标签**
- 从标签列表中选择
- 支持多选
- 显示标签颜色预览

**方式二: 创建新标签**
- 输入新标签名称
- 系统自动分配颜色(或允许用户选择)
- 创建后立即关联到当前 Ticket

**限制:**
- 同一个标签不能重复添加到同一个 Ticket
- 标签名称 1-30 字符
- 标签名称唯一(不区分大小写)

#### 2.2.3 从 Ticket 移除标签
**功能描述:** 解除 Ticket 与某个标签的关联

**行为:**
- 仅删除关联关系
- 标签本身保留在系统中
- 该标签仍可被其他 Ticket 使用

**批量操作:**
- 可以一次移除多个标签

#### 2.2.4 标签的全局管理
**查看所有标签:**
- 列表显示所有标签
- 显示每个标签关联的 Ticket 数量
- 按使用频率或名称排序

**编辑标签(可选):**
- 修改标签名称
- 修改标签颜色
- 影响所有使用该标签的 Ticket

**删除未使用的标签(可选):**
- 删除没有任何 Ticket 使用的标签
- 需要确认操作

### 2.3 查看与筛选

#### 2.3.1 按标签筛选
**功能描述:** 根据标签快速找到相关 Ticket

**单标签筛选:**
- 点击某个标签
- 显示所有包含该标签的 Ticket

**多标签筛选:**
- 可以选择多个标签
- 支持两种模式:
  - AND 模式: 显示同时包含所有选中标签的 Ticket
  - OR 模式: 显示包含任一选中标签的 Ticket

**标签统计:**
- 在筛选面板显示每个标签的 Ticket 数量
- 实时更新计数

**清除筛选:**
- 一键清除所有标签筛选
- 返回完整列表

#### 2.3.2 按标题搜索
**功能描述:** 通过关键词快速查找 Ticket

**搜索特性:**
- 模糊匹配(部分匹配即可)
- 不区分大小写
- 搜索范围: 仅 Ticket 标题
- 实时搜索(输入时即时显示结果)

**搜索体验:**
- 输入防抖(避免频繁请求)
- 高亮显示匹配的关键词
- 空搜索词显示全部结果
- 搜索结果数量提示

**搜索与筛选结合:**
- 可以同时使用标签筛选和标题搜索
- 两者为 AND 关系(同时满足)

#### 2.3.3 按完成状态筛选
**筛选选项:**
- 查看全部 Ticket
- 仅查看未完成
- 仅查看已完成

**默认视图:**
- 默认显示未完成的 Ticket

**状态统计:**
- 显示各状态的 Ticket 数量

### 2.4 列表展示

#### 2.4.1 显示内容
**每个 Ticket 卡片包含:**
- 标题(醒目显示)
- 描述摘要(前 100 字符,可选显示)
- 关联的标签(彩色标签)
- 完成状态(复选框或图标)
- 创建时间
- 最后修改时间(可选)

#### 2.4.2 排序方式
**默认排序:**
- 按创建时间倒序(最新的在前)

**可选排序:**
- 按修改时间
- 按标题字母序
- 按完成状态(未完成在前)

#### 2.4.3 视觉设计
**已完成的 Ticket:**
- 标题添加删除线
- 整体半透明或变灰
- 可选择性隐藏或折叠

**交互效果:**
- 鼠标悬停高亮
- 点击展开完整详情
- 平滑的动画过渡

**响应式设计:**
- 桌面端: 卡片网格布局
- 平板: 两列布局
- 移动端: 单列布局

#### 2.4.4 空状态
**无 Ticket 时:**
- 显示友好的空状态插图
- 提示创建第一个 Ticket
- 提供快捷创建按钮

**无搜索结果时:**
- 显示"未找到匹配的 Ticket"
- 提示调整搜索条件
- 显示当前的筛选条件

---

## 3. 数据模型设计

### 3.1 实体关系

```
Ticket (1) ←→ (N) Ticket_Tag (N) ←→ (1) Tag
```

### 3.2 Tickets 表

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | BIGSERIAL | PRIMARY KEY | 自增主键 |
| title | VARCHAR(200) | NOT NULL | 标题 |
| description | TEXT | NULL | 描述内容 |
| is_completed | BOOLEAN | NOT NULL, DEFAULT FALSE | 完成状态 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 更新时间 |
| completed_at | TIMESTAMPTZ | NULL | 完成时间 |

**索引:**
- `idx_tickets_created_at` - 加速按时间排序
- `idx_tickets_is_completed` - 加速状态筛选
- `idx_tickets_title_gin` - 全文搜索索引(使用 GIN)

**触发器:**
- 自动更新 `updated_at` 字段
- 完成时自动设置 `completed_at`
- 取消完成时清空 `completed_at`

### 3.3 Tags 表

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | BIGSERIAL | PRIMARY KEY | 自增主键 |
| name | VARCHAR(30) | NOT NULL, UNIQUE | 标签名称(唯一) |
| color | VARCHAR(7) | NOT NULL | 颜色(十六进制 #RRGGBB) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 创建时间 |

**索引:**
- `idx_tags_name` - 唯一索引,加速名称查找

**约束:**
- name 唯一性约束
- color 格式验证(正则表达式)

### 3.4 Ticket_Tags 关联表

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| ticket_id | BIGINT | NOT NULL, FK → tickets(id) | Ticket 外键 |
| tag_id | BIGINT | NOT NULL, FK → tags(id) | Tag 外键 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 关联创建时间 |

**主键:**
- 联合主键: (ticket_id, tag_id)

**外键约束:**
- ticket_id 外键,级联删除(ON DELETE CASCADE)
- tag_id 外键,级联删除(ON DELETE CASCADE)

**索引:**
- `idx_ticket_tags_ticket` - 加速通过 Ticket 查标签
- `idx_ticket_tags_tag` - 加速通过标签查 Ticket

### 3.5 数据库触发器示例

```sql
-- 自动更新 updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON tickets
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- 自动管理 completed_at
CREATE OR REPLACE FUNCTION manage_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_completed = TRUE AND OLD.is_completed = FALSE THEN
    NEW.completed_at = NOW();
  ELSIF NEW.is_completed = FALSE AND OLD.is_completed = TRUE THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER manage_completion
BEFORE UPDATE ON tickets
FOR EACH ROW
EXECUTE FUNCTION manage_completed_at();
```

---

## 4. API 接口设计

### 4.1 接口规范

**基础路径:** `/api/v1`

**响应格式:** JSON

**HTTP 状态码约定:**
- 200 OK - 成功获取/更新
- 201 Created - 成功创建
- 204 No Content - 成功删除
- 400 Bad Request - 请求参数错误
- 404 Not Found - 资源不存在
- 422 Unprocessable Entity - 验证失败
- 500 Internal Server Error - 服务器错误

**统一响应格式(成功):**
```json
{
  "data": { /* 实际数据 */ },
  "message": "操作成功"
}
```

**统一响应格式(错误):**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "标题不能为空",
    "details": { /* 详细错误信息 */ }
  }
}
```

### 4.2 Ticket 相关接口

#### 4.2.1 获取 Ticket 列表
```
GET /api/v1/tickets
```

**查询参数:**
- `is_completed` (可选): true | false | 不传(全部)
- `tag_ids` (可选): 标签 ID 列表,逗号分隔,如 "1,3,5"
- `tag_filter_mode` (可选): "and" | "or",默认 "and"
- `search` (可选): 搜索关键词
- `sort_by` (可选): "created_at" | "updated_at" | "title",默认 "created_at"
- `order` (可选): "asc" | "desc",默认 "desc"
- `page` (可选): 页码,默认 1
- `page_size` (可选): 每页数量,默认 50,最大 100

**响应示例:**
```json
{
  "data": {
    "items": [
      {
        "id": 1,
        "title": "优化数据库查询性能",
        "description": "当前列表查询耗时过长,需要添加索引",
        "is_completed": false,
        "tags": [
          {
            "id": 1,
            "name": "后端",
            "color": "#3B82F6"
          },
          {
            "id": 3,
            "name": "性能优化",
            "color": "#10B981"
          }
        ],
        "created_at": "2025-11-09T10:30:00Z",
        "updated_at": "2025-11-09T14:20:00Z",
        "completed_at": null
      }
    ],
    "pagination": {
      "total": 42,
      "page": 1,
      "page_size": 50,
      "total_pages": 1
    }
  }
}
```

#### 4.2.2 获取单个 Ticket
```
GET /api/v1/tickets/{id}
```

**路径参数:**
- `id`: Ticket ID

**响应:** 单个 Ticket 对象

#### 4.2.3 创建 Ticket
```
POST /api/v1/tickets
```

**请求体:**
```json
{
  "title": "修复登录页面样式问题",
  "description": "移动端登录按钮位置不正确",
  "tag_ids": [2, 5]  // 可选,关联已有标签
}
```

**响应:** 创建的 Ticket 对象 (状态码 201)

#### 4.2.4 更新 Ticket
```
PATCH /api/v1/tickets/{id}
```

**请求体:**
```json
{
  "title": "修复登录页面样式问题(已完成 90%)",
  "description": "移动端登录按钮位置已修正,待测试"
}
```

**响应:** 更新后的 Ticket 对象

#### 4.2.5 删除 Ticket
```
DELETE /api/v1/tickets/{id}
```

**响应:** 状态码 204

#### 4.2.6 切换完成状态
```
POST /api/v1/tickets/{id}/toggle-complete
```

**行为:**
- 如果当前是未完成,则标记为完成
- 如果当前是已完成,则标记为未完成

**响应:** 更新后的 Ticket 对象

或者分开两个接口:

```
POST /api/v1/tickets/{id}/complete    # 标记完成
POST /api/v1/tickets/{id}/uncomplete  # 取消完成
```

### 4.3 标签相关接口

#### 4.3.1 获取所有标签
```
GET /api/v1/tags
```

**查询参数:**
- `include_count` (可选): true | false,是否包含使用计数,默认 true

**响应:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "后端",
      "color": "#3B82F6",
      "ticket_count": 12,
      "created_at": "2025-11-01T08:00:00Z"
    },
    {
      "id": 2,
      "name": "前端",
      "color": "#10B981",
      "ticket_count": 8,
      "created_at": "2025-11-01T08:00:00Z"
    }
  ]
}
```

#### 4.3.2 创建标签
```
POST /api/v1/tags
```

**请求体:**
```json
{
  "name": "紧急",
  "color": "#EF4444"  // 可选,不传则自动生成
}
```

**响应:** 创建的标签对象 (状态码 201)

#### 4.3.3 更新标签
```
PATCH /api/v1/tags/{id}
```

**请求体:**
```json
{
  "name": "高优先级",
  "color": "#DC2626"
}
```

**响应:** 更新后的标签对象

#### 4.3.4 删除标签
```
DELETE /api/v1/tags/{id}
```

**行为:**
- 删除标签本身
- 自动解除所有 Ticket 的关联(级联删除)

**响应:** 状态码 204

### 4.4 Ticket 标签关联接口

#### 4.4.1 为 Ticket 添加标签
```
POST /api/v1/tickets/{ticket_id}/tags
```

**请求体(方式一 - 使用已有标签):**
```json
{
  "tag_ids": [1, 3, 5]
}
```

**请求体(方式二 - 创建并添加新标签):**
```json
{
  "new_tags": [
    {
      "name": "待讨论",
      "color": "#F59E0B"
    }
  ]
}
```

**请求体(方式三 - 混合):**
```json
{
  "tag_ids": [1, 3],
  "new_tags": [
    {
      "name": "待讨论"
    }
  ]
}
```

**响应:** 更新后的 Ticket 对象(包含新的标签列表)

#### 4.4.2 从 Ticket 移除标签
```
DELETE /api/v1/tickets/{ticket_id}/tags/{tag_id}
```

**响应:** 状态码 204

#### 4.4.3 批量移除标签
```
DELETE /api/v1/tickets/{ticket_id}/tags
```

**请求体:**
```json
{
  "tag_ids": [1, 3, 5]
}
```

**响应:** 状态码 204

---

## 5. 前端架构设计

### 5.1 页面布局

```
┌─────────────────────────────────────────────────────┐
│                    顶部导航栏                         │
│  [Logo]  [搜索框]                    [新建 Ticket]   │
└─────────────────────────────────────────────────────┘
┌──────────┬──────────────────────────────────────────┐
│          │                                          │
│  侧边栏   │           主内容区                        │
│          │                                          │
│  筛选器   │  ┌────────────────────────────────────┐ │
│          │  │ Ticket 卡片                         │ │
│ 完成状态  │  │ □ 优化数据库查询性能                 │ │
│ □ 全部   │  │ 当前列表查询耗时过长...              │ │
│ ☑ 未完成  │  │ [后端] [性能优化]                   │ │
│ □ 已完成  │  │ 创建于 2小时前                      │ │
│          │  └────────────────────────────────────┘ │
│ 标签列表  │  ┌────────────────────────────────────┐ │
│ [后端](12)│  │ ☑ 修复登录页面样式                  │ │
│ [前端](8) │  │ 移动端登录按钮...                   │ │
│ [Bug](5) │  │ [前端] [Bug]                        │ │
│          │  │ 完成于 昨天                         │ │
│          │  └────────────────────────────────────┘ │
└──────────┴──────────────────────────────────────────┘
```

### 5.2 核心组件

#### 5.2.1 TicketList 组件
**职责:** 渲染 Ticket 列表,处理加载、空状态、错误状态

**Props:**
```typescript
interface TicketListProps {
  filters: {
    isCompleted?: boolean;
    tagIds?: number[];
    search?: string;
  };
  onTicketClick: (ticket: Ticket) => void;
}
```

**状态:**
- 加载中
- 数据列表
- 错误信息
- 分页信息

#### 5.2.2 TicketCard 组件
**职责:** 单个 Ticket 的卡片展示

**Props:**
```typescript
interface TicketCardProps {
  ticket: Ticket;
  onToggleComplete: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}
```

**特性:**
- 展开/折叠描述
- 快捷操作按钮
- 标签展示
- 完成状态视觉区分

#### 5.2.3 TicketFormDialog 组件
**职责:** 创建/编辑 Ticket 的弹窗表单

**模式:**
- 创建模式: 空表单
- 编辑模式: 预填数据

**表单字段:**
- 标题输入框
- 描述文本域
- 标签多选器

**验证:**
- 实时验证
- 提交前验证
- 错误提示

#### 5.2.4 TagSelector 组件
**职责:** 标签选择器

**功能:**
- 下拉多选
- 搜索过滤
- 创建新标签
- 颜色预览
- 已选标签展示

**使用 Shadcn 组件:**
- Command
- Popover
- Badge

#### 5.2.5 FilterSidebar 组件
**职责:** 筛选条件侧边栏

**包含:**
- 完成状态单选
- 标签列表(多选)
- 清除筛选按钮
- 标签使用统计

#### 5.2.6 SearchBar 组件
**职责:** 搜索输入框

**特性:**
- 防抖输入(300ms)
- 清除按钮
- 快捷键支持(Cmd/Ctrl + K)
- 搜索图标

### 5.3 状态管理

使用 **Zustand** 进行全局状态管理:

```typescript
interface AppStore {
  // Ticket 相关
  tickets: Ticket[];
  ticketsLoading: boolean;
  ticketsError: string | null;

  // 标签相关
  tags: Tag[];
  tagsLoading: boolean;

  // 筛选器
  filters: {
    isCompleted: boolean | null;  // null 表示全部
    selectedTagIds: number[];
    tagFilterMode: 'and' | 'or';
    searchQuery: string;
  };

  // 分页
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };

  // Actions
  fetchTickets: () => Promise<void>;
  createTicket: (data: CreateTicketInput) => Promise<void>;
  updateTicket: (id: number, data: UpdateTicketInput) => Promise<void>;
  deleteTicket: (id: number) => Promise<void>;
  toggleComplete: (id: number) => Promise<void>;

  fetchTags: () => Promise<void>;
  createTag: (data: CreateTagInput) => Promise<void>;

  addTagsToTicket: (ticketId: number, tagIds: number[]) => Promise<void>;
  removeTagFromTicket: (ticketId: number, tagId: number) => Promise<void>;

  // 筛选器操作
  setCompletionFilter: (value: boolean | null) => void;
  toggleTagFilter: (tagId: number) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
}
```

### 5.4 路由设计

**单页应用,主要视图:**
- `/` - 主页(Ticket 列表)
- 使用 URL 查询参数保存筛选状态
  - `?completed=true`
  - `?tags=1,3,5`
  - `?search=登录`

**好处:**
- 可分享的筛选链接
- 浏览器前进/后退支持
- 刷新保持筛选状态

### 5.5 类型定义

```typescript
// Ticket 类型
interface Ticket {
  id: number;
  title: string;
  description: string | null;
  isCompleted: boolean;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

interface CreateTicketInput {
  title: string;
  description?: string;
  tagIds?: number[];
}

interface UpdateTicketInput {
  title?: string;
  description?: string;
}

// Tag 类型
interface Tag {
  id: number;
  name: string;
  color: string;
  ticketCount?: number;
  createdAt: string;
}

interface CreateTagInput {
  name: string;
  color?: string;
}
```

### 5.6 UI/UX 设计细节

#### 5.6.1 颜色系统
**主题色:**
- 主色: Blue-600 (#2563EB)
- 成功: Green-600 (#16A34A)
- 警告: Yellow-500 (#EAB308)
- 错误: Red-600 (#DC2626)
- 中性: Slate 系列

**标签颜色预设:**
```typescript
const TAG_COLOR_PALETTE = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#84CC16', // Lime
  '#10B981', // Emerald
  '#14B8A6', // Teal
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#A855F7', // Purple
  '#EC4899', // Pink
];
```

#### 5.6.2 响应式断点
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**布局适配:**
- Mobile: 隐藏侧边栏,使用抽屉;单列 Ticket 列表
- Tablet: 收起侧边栏,图标模式;两列列表
- Desktop: 完整侧边栏;网格布局

#### 5.6.3 动画效果
- Ticket 卡片进入/退出: 淡入淡出 + 轻微缩放
- 完成状态切换: 平滑的透明度变化
- 标签添加/移除: 弹性动画
- 列表加载: Skeleton 占位符

#### 5.6.4 可访问性(a11y)
- 键盘导航支持
- ARIA 标签
- 焦点管理
- 高对比度支持

#### 5.6.5 快捷键
- `Cmd/Ctrl + K`: 聚焦搜索框
- `N`: 新建 Ticket
- `Esc`: 关闭对话框/清除搜索
- `↑/↓`: 列表导航
- `Enter`: 编辑选中项
- `Space`: 切换完成状态

---

## 6. 后端实现细节

### 6.1 项目结构

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI 应用入口
│   ├── config.py               # 配置管理
│   ├── database.py             # 数据库连接
│   │
│   ├── models/                 # SQLAlchemy 模型
│   │   ├── __init__.py
│   │   ├── ticket.py
│   │   └── tag.py
│   │
│   ├── schemas/                # Pydantic 模型
│   │   ├── __init__.py
│   │   ├── ticket.py
│   │   └── tag.py
│   │
│   ├── api/                    # API 路由
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── tickets.py
│   │   │   └── tags.py
│   │
│   ├── services/               # 业务逻辑
│   │   ├── __init__.py
│   │   ├── ticket_service.py
│   │   └── tag_service.py
│   │
│   ├── repositories/           # 数据访问层
│   │   ├── __init__.py
│   │   ├── ticket_repo.py
│   │   └── tag_repo.py
│   │
│   └── utils/                  # 工具函数
│       ├── __init__.py
│       ├── color_generator.py
│       └── validators.py
│
├── tests/                      # 测试
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_tickets.py
│   └── test_tags.py
│
├── alembic/                    # 数据库迁移
│   ├── versions/
│   └── env.py
│
├── pyproject.toml              # uv 项目配置
├── .env.example
└── README.md
```

### 6.2 配置管理

```python
# config.py
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # 数据库
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/projectalpha"

    # API
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Ticket 管理工具"
    VERSION: str = "1.0.0"

    # CORS
    ALLOWED_ORIGINS: list[str] = ["http://localhost:5173"]

    # 分页
    DEFAULT_PAGE_SIZE: int = 50
    MAX_PAGE_SIZE: int = 100

    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache
def get_settings() -> Settings:
    return Settings()
```

### 6.3 依赖注入示例

```python
# dependencies.py
from sqlalchemy.orm import Session
from app.database import SessionLocal

def get_db():
    """数据库会话依赖"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### 6.4 错误处理

```python
# exceptions.py
class AppException(Exception):
    """应用基础异常"""
    def __init__(self, message: str, code: str):
        self.message = message
        self.code = code
        super().__init__(self.message)

class TicketNotFound(AppException):
    def __init__(self):
        super().__init__("Ticket 不存在", "TICKET_NOT_FOUND")

class TagNotFound(AppException):
    def __init__(self):
        super().__init__("标签不存在", "TAG_NOT_FOUND")

class DuplicateTag(AppException):
    def __init__(self):
        super().__init__("标签名称已存在", "DUPLICATE_TAG")

# 全局异常处理器
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=400,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message
            }
        }
    )
```

### 6.5 颜色生成工具

```python
# utils/color_generator.py
import random

TAG_COLOR_PALETTE = [
    '#EF4444', '#F97316', '#F59E0B', '#84CC16',
    '#10B981', '#14B8A6', '#06B6D4', '#3B82F6',
    '#6366F1', '#8B5CF6', '#A855F7', '#EC4899',
]

def generate_random_color() -> str:
    """从预设调色板随机选择颜色"""
    return random.choice(TAG_COLOR_PALETTE)

def generate_color_from_name(name: str) -> str:
    """根据名称确定性生成颜色(同名同色)"""
    hash_value = sum(ord(c) for c in name)
    index = hash_value % len(TAG_COLOR_PALETTE)
    return TAG_COLOR_PALETTE[index]
```

### 6.6 CORS 和中间件配置

```python
# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings

settings = get_settings()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 请求日志中间件
import time
from fastapi import Request

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

---

## 7. 数据库设置

### 7.1 环境准备

**安装 PostgreSQL:**
- macOS: `brew install postgresql@17`
- 启动服务: `brew services start postgresql@17`

**创建数据库和用户:**
```sql
-- 创建用户(如果不存在)
CREATE USER postgres WITH PASSWORD 'postgres';

-- 创建数据库
CREATE DATABASE projectalpha OWNER postgres;

-- 授权
GRANT ALL PRIVILEGES ON DATABASE projectalpha TO postgres;
```

### 7.2 使用 Alembic 管理迁移

**初始化:**
```bash
alembic init alembic
```

**配置 alembic.ini:**
```ini
sqlalchemy.url = postgresql://postgres:postgres@localhost:5432/projectalpha
```

**创建迁移:**
```bash
alembic revision --autogenerate -m "Initial schema"
```

**执行迁移:**
```bash
alembic upgrade head
```

**回滚:**
```bash
alembic downgrade -1
```

---

## 8. 开发工作流

### 8.1 后端开发

**环境搭建:**
```bash
# 安装 uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# 创建项目
cd backend
uv init

# 安装依赖
uv add fastapi uvicorn sqlalchemy psycopg2-binary pydantic-settings alembic

# 安装开发依赖
uv add --dev pytest httpx pytest-asyncio
```

**启动开发服务器:**
```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**运行测试:**
```bash
uv run pytest
```

### 8.2 前端开发

**环境搭建:**
```bash
# 创建 Vite 项目
npm create vite@latest frontend -- --template react-ts

cd frontend

# 安装依赖
npm install

# 安装 Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 安装 Shadcn
npx shadcn@latest init

# 安装其他依赖
npm install zustand @tanstack/react-query axios
```

**启动开发服务器:**
```bash
npm run dev
```

**构建生产版本:**
```bash
npm run build
```

### 8.3 开发流程

1. **后端优先:**
   - 设计数据库 schema
   - 实现 API 接口
   - 编写单元测试
   - 使用 Swagger UI 测试接口

2. **前端开发:**
   - 创建基础组件
   - 实现状态管理
   - 对接 API
   - UI/UX 优化

3. **集成测试:**
   - 端到端测试
   - 性能测试
   - 兼容性测试

---

## 9. 测试策略

### 9.1 后端测试

**单元测试(pytest):**
```python
# tests/test_ticket_service.py
import pytest
from app.services.ticket_service import TicketService
from app.schemas.ticket import CreateTicketInput

@pytest.fixture
def ticket_service(db_session):
    return TicketService(db_session)

def test_create_ticket(ticket_service):
    data = CreateTicketInput(
        title="测试 Ticket",
        description="这是描述"
    )
    ticket = ticket_service.create_ticket(data)

    assert ticket.id is not None
    assert ticket.title == "测试 Ticket"
    assert ticket.is_completed is False

def test_toggle_complete(ticket_service):
    ticket = ticket_service.create_ticket(
        CreateTicketInput(title="测试")
    )

    # 标记完成
    updated = ticket_service.toggle_complete(ticket.id)
    assert updated.is_completed is True
    assert updated.completed_at is not None

    # 取消完成
    updated = ticket_service.toggle_complete(ticket.id)
    assert updated.is_completed is False
    assert updated.completed_at is None
```

**API 测试(httpx):**
```python
# tests/test_api_tickets.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_ticket():
    response = client.post(
        "/api/v1/tickets",
        json={
            "title": "新 Ticket",
            "description": "描述"
        }
    )
    assert response.status_code == 201
    data = response.json()["data"]
    assert data["title"] == "新 Ticket"

def test_list_tickets():
    response = client.get("/api/v1/tickets")
    assert response.status_code == 200
    data = response.json()["data"]
    assert "items" in data
    assert "pagination" in data
```

### 9.2 前端测试

**组件测试(Vitest + React Testing Library):**
```typescript
// TicketCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TicketCard } from './TicketCard';

test('renders ticket card with title', () => {
  const ticket = {
    id: 1,
    title: '测试 Ticket',
    description: '描述',
    isCompleted: false,
    tags: [],
    createdAt: '2025-11-09T10:00:00Z',
    updatedAt: '2025-11-09T10:00:00Z',
    completedAt: null,
  };

  render(<TicketCard ticket={ticket} />);
  expect(screen.getByText('测试 Ticket')).toBeInTheDocument();
});

test('toggles completion on checkbox click', () => {
  const handleToggle = vi.fn();
  const ticket = { /* ... */ };

  render(<TicketCard ticket={ticket} onToggleComplete={handleToggle} />);

  const checkbox = screen.getByRole('checkbox');
  fireEvent.click(checkbox);

  expect(handleToggle).toHaveBeenCalledWith(ticket.id);
});
```

**E2E 测试(Playwright):**
```typescript
// e2e/ticket-management.spec.ts
import { test, expect } from '@playwright/test';

test('create and complete a ticket', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // 点击新建按钮
  await page.click('button:has-text("新建 Ticket")');

  // 填写表单
  await page.fill('input[name="title"]', '测试 E2E Ticket');
  await page.fill('textarea[name="description"]', '这是 E2E 测试');

  // 提交
  await page.click('button:has-text("创建")');

  // 验证创建成功
  await expect(page.locator('text=测试 E2E Ticket')).toBeVisible();

  // 标记完成
  await page.click('[data-testid="toggle-complete-1"]');

  // 验证完成状态
  await expect(page.locator('[data-testid="ticket-1"]')).toHaveClass(/completed/);
});
```

---

## 10. 性能优化

### 10.1 数据库优化

**索引策略:**
- `tickets.created_at` - 排序优化
- `tickets.is_completed` - 状态筛选
- `tickets.title` (GIN) - 全文搜索
- `tags.name` (UNIQUE) - 唯一性检查
- `ticket_tags.ticket_id` - JOIN 优化
- `ticket_tags.tag_id` - JOIN 优化

**查询优化:**
- 使用 `JOIN` 预加载关联数据,避免 N+1
- 使用 `EXPLAIN ANALYZE` 分析慢查询
- 合理使用分页,避免一次性加载大量数据

**连接池配置:**
```python
from sqlalchemy import create_engine

engine = create_engine(
    DATABASE_URL,
    pool_size=5,          # 连接池大小
    max_overflow=10,      # 最大溢出连接数
    pool_pre_ping=True,   # 连接健康检查
    pool_recycle=3600,    # 连接回收时间(秒)
)
```

### 10.2 后端优化

**缓存策略:**
- 标签列表缓存(使用 Redis 或内存缓存)
- API 响应缓存(对于不常变的数据)

**异步处理:**
- FastAPI 原生支持异步
- 数据库操作使用 `asyncpg` 替代 `psycopg2`(可选)

### 10.3 前端优化

**代码拆分:**
```typescript
// 懒加载路由组件
const TicketDetail = lazy(() => import('./pages/TicketDetail'));
```

**虚拟滚动:**
- 对于长列表使用 `react-virtual` 或 `react-window`

**请求优化:**
- 使用 React Query 的缓存和自动重试
- 防抖搜索输入
- 批量请求合并

**资源优化:**
- 图片懒加载
- 使用 Vite 的代码分割
- 压缩构建产物

---

## 11. 安全考虑

### 11.1 输入验证

**后端:**
- Pydantic 自动验证请求数据
- 防止 SQL 注入(使用 ORM)
- 字符串长度限制
- 特殊字符过滤

**前端:**
- 表单验证
- XSS 防护(React 自动转义)
- CSP (Content Security Policy)

### 11.2 API 安全

**速率限制:**
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/api/v1/tickets")
@limiter.limit("100/minute")
async def list_tickets():
    pass
```

**CORS 配置:**
- 仅允许前端域名
- 生产环境使用 HTTPS

---

## 12. 部署方案

### 12.1 本地开发环境

**数据库:**
- 本地 PostgreSQL 17
- 数据库: `projectalpha`
- 用户: `postgres:postgres`

**后端:**
```bash
cd backend
uv run uvicorn app.main:app --reload --port 8000
```

**前端:**
```bash
cd frontend
npm run dev  # 默认端口 5173
```

### 12.2 生产环境(可选方案)

**Docker Compose 部署:**
```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:17
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: projectalpha
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/projectalpha
    ports:
      - "8000:8000"
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

**环境变量:**
```env
# .env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/projectalpha
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## 13. 未来扩展方向

### 13.1 功能扩展

**V1.0 (MVP - 当前版本):**
- 基础 CRUD
- 标签管理
- 搜索筛选

**V1.1 (增强版):**
- 优先级字段(低/中/高)
- 截止日期
- Ticket 排序(拖拽)
- 批量操作

**V1.2 (高级功能):**
- 附件上传
- 评论系统
- 活动历史
- 数据导出(CSV/JSON)

**V2.0 (协作版):**
- 用户认证
- 多用户协作
- 权限管理
- 实时同步(WebSocket)

### 13.2 技术优化

- PWA 支持(离线使用)
- 移动端适配优化
- 暗黑模式
- 国际化(i18n)
- 性能监控(Sentry)
- 数据统计面板

---

## 14. 开发时间估算

### 14.1 详细分解

**数据库设计:** 0.5 天
- Schema 设计
- 迁移脚本
- 测试数据

**后端开发:** 2-3 天
- 项目搭建: 0.5 天
- 模型和 Schema: 0.5 天
- API 实现: 1 天
- 测试: 0.5-1 天

**前端开发:** 3-4 天
- 项目搭建和配置: 0.5 天
- 组件开发: 1.5 天
- 状态管理和 API 集成: 1 天
- UI 优化: 0.5-1 天
- 测试: 0.5 天

**总计:** 6-8 个工作日

---

## 15. 交付清单

### 15.1 代码
- [ ] 后端完整源码
- [ ] 前端完整源码
- [ ] 数据库迁移脚本
- [ ] Docker 配置文件
- [ ] 环境变量示例

### 15.2 文档
- [ ] API 文档(自动生成 Swagger)
- [ ] 数据库 Schema 文档
- [ ] 部署指南
- [ ] 开发者文档
- [ ] 用户手册

### 15.3 测试
- [ ] 后端单元测试(覆盖率 > 80%)
- [ ] API 集成测试
- [ ] 前端组件测试
- [ ] E2E 测试

---

## 附录

### A. 技术栈版本

**后端:**
- Python: 3.11+
- FastAPI: 0.115+
- SQLAlchemy: 2.0+
- PostgreSQL: 17+
- Pydantic: 2.0+

**前端:**
- Node.js: 20+
- TypeScript: 5.0+
- React: 18+
- Vite: 7+
- Tailwind CSS: 4+

### B. 参考资源

- [FastAPI 官方文档](https://fastapi.tiangolo.com/)
- [Shadcn UI 组件库](https://ui.shadcn.com/)
- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)
- [Tailwind CSS 文档](https://tailwindcss.com/)

---

**文档版本:** 1.0
**创建日期:** 2025-11-09
**作者:** Claude
**状态:** 待评审
