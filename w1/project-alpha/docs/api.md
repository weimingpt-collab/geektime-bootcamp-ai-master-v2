# Project Alpha API 文档

## 基础信息

- **Base URL**: `http://localhost:8000/api/v1`
- **API 版本**: v1
- **内容类型**: `application/json`

## 认证

当前版本无需认证（单用户模式）。

## Tickets API

### 获取 Ticket 列表

```http
GET /tickets
```

**查询参数**:

- `status` (可选): 状态过滤 (`all`, `pending`, `completed`)
- `tag_ids` (可选): 标签 ID 列表（逗号分隔）
- `search` (可选): 搜索关键词
- `skip` (可选): 跳过数量，默认 0
- `limit` (可选): 返回数量，默认 50，最大 100

**响应示例**:

```json
{
  "tickets": [
    {
      "id": 1,
      "title": "示例 Ticket",
      "description": "描述",
      "status": "pending",
      "tags": [],
      "created_at": "2025-11-10T10:00:00Z",
      "updated_at": "2025-11-10T10:00:00Z",
      "completed_at": null
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

### 获取单个 Ticket

```http
GET /tickets/{ticket_id}
```

### 创建 Ticket

```http
POST /tickets
Content-Type: application/json

{
  "title": "新 Ticket",
  "description": "可选描述",
  "tag_ids": [1, 2]
}
```

### 更新 Ticket

```http
PUT /tickets/{ticket_id}
Content-Type: application/json

{
  "title": "更新后的标题",
  "description": "更新后的描述"
}
```

### 删除 Ticket

```http
DELETE /tickets/{ticket_id}
```

### 完成 Ticket

```http
PATCH /tickets/{ticket_id}/complete
```

### 取消完成 Ticket

```http
PATCH /tickets/{ticket_id}/uncomplete
```

### 添加标签到 Ticket

```http
POST /tickets/{ticket_id}/tags
Content-Type: application/json

[1, 2, 3]
```

### 从 Ticket 移除标签

```http
DELETE /tickets/{ticket_id}/tags/{tag_id}
```

## Tags API

### 获取 Tag 列表

```http
GET /tags
```

### 获取单个 Tag

```http
GET /tags/{tag_id}
```

### 创建 Tag

```http
POST /tags
Content-Type: application/json

{
  "name": "新标签",
  "color": "#FF0000"
}
```

### 删除 Tag

```http
DELETE /tags/{tag_id}
```

## 错误响应

所有错误响应遵循以下格式：

```json
{
  "detail": "错误描述"
}
```

**HTTP 状态码**:

- `200`: 成功
- `201`: 创建成功
- `204`: 删除成功（无内容）
- `400`: 请求错误
- `404`: 资源不存在
- `500`: 服务器错误

## 完整 API 文档

访问 Swagger UI 查看完整的交互式 API 文档：
<http://localhost:8000/api/v1/docs>
