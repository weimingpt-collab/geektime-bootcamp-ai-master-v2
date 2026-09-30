# Open Notebook Worker 与 SurrealDB 交互机制详解

## 1. 概述

Open Notebook 使用 `surreal-commands` 库实现基于 SurrealDB 的后台任务队列系统。Worker 是一个独立进程，负责从 SurrealDB 中拉取待处理的命令（Command），执行后将结果写回数据库。

### 1.1 核心组件

| 组件 | 职责 |
|------|------|
| **surreal-commands** | 提供命令注册、提交、执行的框架 |
| **SurrealDB** | 作为命令队列的持久化存储 |
| **Worker Process** | 独立进程，轮询并执行命令 |
| **Command Service** | API 层封装，提供提交和查询接口 |

### 1.2 依赖版本

```toml
# pyproject.toml
surreal-commands>=1.2.0
surrealdb>=1.0.4
```

---

## 2. 系统架构

### 2.1 整体架构图

```mermaid
graph TB
    subgraph "客户端层"
        CLIENT["HTTP Client<br/>Frontend/CLI"]
    end

    subgraph "API 层"
        API["FastAPI Server<br/>:5055"]
        ROUTER["commands router<br/>/api/commands/*"]
        SERVICE["CommandService"]
    end

    subgraph "命令注册层"
        REG["Command Registry"]
        CMD1["embed_chunk"]
        CMD2["vectorize_source"]
        CMD3["generate_podcast"]
        CMD4["rebuild_embeddings"]
    end

    subgraph "Worker 层"
        WORKER["surreal-commands-worker<br/>(独立进程)"]
        POLL["Polling Loop"]
        EXEC["Command Executor"]
    end

    subgraph "数据层"
        SURREAL[("SurrealDB<br/>command 表")]
    end

    CLIENT -->|POST /commands/jobs| API
    API --> ROUTER
    ROUTER --> SERVICE
    SERVICE -->|submit_command| REG
    REG -->|INSERT| SURREAL

    WORKER --> POLL
    POLL -->|SELECT pending| SURREAL
    SURREAL -->|command data| POLL
    POLL --> EXEC
    EXEC -->|执行| CMD1
    EXEC -->|执行| CMD2
    EXEC -->|执行| CMD3
    EXEC -->|执行| CMD4
    EXEC -->|UPDATE status| SURREAL

    CLIENT -->|GET /commands/jobs/:id| API
    API -->|get_command_status| SURREAL
```

### 2.2 进程模型

```mermaid
graph LR
    subgraph "Docker Container"
        SUP["Supervisor<br/>(进程管理)"]

        subgraph "Process: API"
            UVICORN["uvicorn<br/>priority=10"]
        end

        subgraph "Process: Worker"
            WORKER["surreal-commands-worker<br/>priority=20"]
        end

        subgraph "Process: Frontend"
            NEXT["npm run start<br/>priority=30"]
        end
    end

    SUP --> UVICORN
    SUP --> WORKER
    SUP --> NEXT
```

**supervisord.conf 配置**:
```ini
[program:worker]
command=uv run surreal-commands-worker --import-modules commands
stdout_logfile=/dev/stdout
stderr_logfile=/dev/stderr
autorestart=true
priority=20
autostart=true
startsecs=3
```

---

## 3. 命令生命周期

### 3.1 完整生命周期时序图

```mermaid
sequenceDiagram
    participant Client as HTTP Client
    participant API as FastAPI
    participant Service as CommandService
    participant Registry as Command Registry
    participant DB as SurrealDB
    participant Worker as Worker Process
    participant Handler as Command Handler

    Note over Client,Handler: Phase 1: 命令提交

    Client->>API: POST /api/commands/jobs<br/>{app, command, input}
    API->>Service: submit_command_job()
    Service->>Service: import commands module<br/>(确保命令已注册)
    Service->>Registry: submit_command(app, cmd, args)
    Registry->>DB: INSERT INTO command<br/>{app_id, name, input, status: "queued"}
    DB-->>Registry: command_id
    Registry-->>Service: command_id
    Service-->>API: job_id
    API-->>Client: 202 Accepted<br/>{job_id, status: "submitted"}

    Note over Client,Handler: Phase 2: Worker 轮询

    loop Worker Polling Loop
        Worker->>DB: SELECT * FROM command<br/>WHERE status = "queued"<br/>LIMIT batch_size
        DB-->>Worker: [command records]

        alt 有待处理命令
            Worker->>DB: UPDATE command<br/>SET status = "running"
            Worker->>Handler: 反序列化 input<br/>调用 async handler(input)

            alt 执行成功
                Handler-->>Worker: CommandOutput
                Worker->>DB: UPDATE command SET<br/>status = "completed",<br/>result = output
            else 瞬态错误 (可重试)
                Handler-->>Worker: RuntimeError/ConnectionError
                Worker->>Worker: 等待 backoff
                Worker->>Handler: 重试执行
            else 永久错误
                Handler-->>Worker: ValueError/Exception
                Worker->>DB: UPDATE command SET<br/>status = "failed",<br/>error_message = str(e)
            end
        else 无待处理命令
            Worker->>Worker: sleep(poll_interval)
        end
    end

    Note over Client,Handler: Phase 3: 状态查询

    Client->>API: GET /api/commands/jobs/{job_id}
    API->>Service: get_command_status(job_id)
    Service->>DB: SELECT * FROM command<br/>WHERE id = job_id
    DB-->>Service: command record
    Service-->>API: {status, result, error}
    API-->>Client: CommandJobStatusResponse
```

### 3.2 状态转换图

```mermaid
stateDiagram-v2
    [*] --> queued: submit_command()

    queued --> running: Worker 获取任务

    running --> completed: 执行成功
    running --> failed: 永久错误
    running --> running: 瞬态错误 + 重试

    completed --> [*]
    failed --> [*]

    note right of queued: 等待 Worker 拉取
    note right of running: Handler 执行中
    note right of completed: result 包含输出
    note right of failed: error_message 包含错误
```

---

## 4. 命令定义与注册

### 4.1 命令模块结构

```
commands/
├── __init__.py              # 导出所有命令
├── embedding_commands.py    # 嵌入相关命令
├── podcast_commands.py      # 播客生成命令
├── source_commands.py       # 源处理命令
└── example_commands.py      # 示例命令
```

### 4.2 命令定义模式

```mermaid
classDiagram
    class CommandInput {
        <<Pydantic BaseModel>>
        +execution_context: Optional[ExecutionContext]
        +各种业务参数
    }

    class CommandOutput {
        <<Pydantic BaseModel>>
        +success: bool
        +processing_time: float
        +error_message: Optional[str]
        +各种结果字段
    }

    class command {
        <<Decorator>>
        +name: str
        +app: str
        +retry: Optional[dict]
    }

    CommandInput <.. command : 参数类型
    CommandOutput <.. command : 返回类型
```

**代码示例** (`commands/embedding_commands.py`):

```python
from surreal_commands import command, CommandInput, CommandOutput

# 1. 定义输入模型
class EmbedChunkInput(CommandInput):
    source_id: str
    chunk_index: int
    chunk_text: str

# 2. 定义输出模型
class EmbedChunkOutput(CommandOutput):
    success: bool
    source_id: str
    chunk_index: int
    error_message: Optional[str] = None

# 3. 使用 @command 装饰器注册
@command(
    "embed_chunk",           # 命令名称
    app="open_notebook",     # 应用命名空间
    retry={                  # 重试配置
        "max_attempts": 5,
        "wait_strategy": "exponential_jitter",
        "wait_min": 1,
        "wait_max": 30,
        "retry_on": [RuntimeError, ConnectionError, TimeoutError],
    },
)
async def embed_chunk_command(input_data: EmbedChunkInput) -> EmbedChunkOutput:
    """处理单个文本块的嵌入"""
    try:
        # 业务逻辑
        embedding = await model.aembed([input_data.chunk_text])
        await repo_query("CREATE source_embedding CONTENT {...}")

        return EmbedChunkOutput(
            success=True,
            source_id=input_data.source_id,
            chunk_index=input_data.chunk_index,
        )
    except RuntimeError:
        # 瞬态错误：重新抛出以触发重试
        raise
    except Exception as e:
        # 永久错误：返回失败结果
        return EmbedChunkOutput(
            success=False,
            source_id=input_data.source_id,
            chunk_index=input_data.chunk_index,
            error_message=str(e),
        )
```

### 4.3 已注册命令列表

| 命令名称 | 用途 | 重试策略 |
|----------|------|----------|
| `embed_single_item` | 嵌入单个项目（source/note/insight） | 默认 |
| `embed_chunk` | 嵌入单个文本块 | 5次，指数退避+抖动 |
| `vectorize_source` | 编排源文档向量化 | 禁用 (retry=None) |
| `rebuild_embeddings` | 批量重建嵌入 | 禁用 (retry=None) |
| `generate_podcast` | 生成播客 | 默认 |
| `process_source` | 处理源内容 | 默认 |

---

## 5. Worker 执行机制

### 5.1 Worker 启动流程

```mermaid
flowchart TD
    A[supervisord 启动] --> B[执行 surreal-commands-worker]
    B --> C[--import-modules commands]
    C --> D[加载 commands/__init__.py]
    D --> E[导入所有命令模块]
    E --> F[命令注册到 Registry]
    F --> G[连接 SurrealDB]
    G --> H[进入轮询循环]
```

### 5.2 轮询与执行流程

```mermaid
flowchart TD
    START[开始轮询] --> QUERY[查询 queued 命令]
    QUERY --> CHECK{有待处理?}

    CHECK -->|否| SLEEP[sleep poll_interval]
    SLEEP --> QUERY

    CHECK -->|是| LOCK[UPDATE status = running]
    LOCK --> DESER[反序列化 Input]
    DESER --> LOOKUP[查找 Handler]
    LOOKUP --> EXEC[执行 async handler]

    EXEC --> RESULT{执行结果}

    RESULT -->|成功| COMPLETE[UPDATE status = completed<br/>result = output]
    RESULT -->|瞬态错误| RETRY{重试次数?}
    RESULT -->|永久错误| FAIL[UPDATE status = failed<br/>error_message = str]

    RETRY -->|未达上限| BACKOFF[等待退避时间]
    BACKOFF --> EXEC
    RETRY -->|已达上限| FAIL

    COMPLETE --> QUERY
    FAIL --> QUERY
```

### 5.3 并发控制

```mermaid
graph TB
    subgraph "Worker Process"
        POOL["Task Pool<br/>max_tasks=5"]

        T1["Task 1"]
        T2["Task 2"]
        T3["Task 3"]
        T4["Task 4"]
        T5["Task 5"]
    end

    subgraph "SurrealDB"
        Q["command 表<br/>(queued)"]
    end

    Q -->|SELECT LIMIT 5| POOL
    POOL --> T1
    POOL --> T2
    POOL --> T3
    POOL --> T4
    POOL --> T5
```

**环境变量配置**:
```bash
# Worker 并发任务数
SURREAL_COMMANDS_MAX_TASKS=5

# 轮询间隔（秒）
SURREAL_COMMANDS_POLL_INTERVAL=1
```

---

## 6. 重试机制详解

### 6.1 重试策略类型

```mermaid
graph LR
    subgraph "exponential_jitter (推荐)"
        EJ1["1s"] --> EJ2["~2s±random"]
        EJ2 --> EJ3["~4s±random"]
        EJ3 --> EJ4["~8s±random"]
        EJ4 --> EJ5["~16s±random"]
    end

    subgraph "exponential"
        E1["1s"] --> E2["2s"]
        E2 --> E3["4s"]
        E3 --> E4["8s"]
        E4 --> E5["16s"]
    end

    subgraph "fixed"
        F1["2s"] --> F2["2s"]
        F2 --> F3["2s"]
        F3 --> F4["2s"]
        F4 --> F5["2s"]
    end
```

### 6.2 重试配置选项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `max_attempts` | int | 3 | 最大重试次数 |
| `wait_strategy` | str | exponential_jitter | 退避策略 |
| `wait_min` | int | 1 | 最小等待秒数 |
| `wait_max` | int | 30 | 最大等待秒数 |
| `retry_on` | List[Exception] | [] | 触发重试的异常类型 |

### 6.3 异常处理模式

```mermaid
flowchart TD
    EXEC[执行命令] --> EXC{异常类型?}

    EXC -->|RuntimeError| TRANS["瞬态错误<br/>(DB 事务冲突)"]
    EXC -->|ConnectionError| TRANS
    EXC -->|TimeoutError| TRANS
    EXC -->|ValueError| PERM["永久错误<br/>(无效输入)"]
    EXC -->|AuthError| PERM
    EXC -->|Other| PERM

    TRANS --> RERAISE[重新抛出异常]
    RERAISE --> RETRY[触发重试机制]

    PERM --> CATCH[捕获异常]
    CATCH --> RETURN[返回失败 Output]
    RETURN --> DONE[status = failed]
```

**代码示例**:
```python
try:
    # 可能失败的操作
    await repo_query("CREATE ...")
except RuntimeError:
    # 瞬态错误：重新抛出以触发重试
    logger.warning("Transaction conflict - will be retried")
    raise
except (ConnectionError, TimeoutError) as e:
    # 网络/超时错误：重新抛出以触发重试
    logger.warning(f"Network error ({type(e).__name__}) - will be retried")
    raise
except ValueError as e:
    # 永久错误：返回失败结果，不重试
    return Output(success=False, error_message=str(e))
```

### 6.4 全局重试配置

```bash
# .env 文件

# 启用/禁用重试（默认 true）
SURREAL_COMMANDS_RETRY_ENABLED=true

# 最大重试次数（默认 3）
SURREAL_COMMANDS_RETRY_MAX_ATTEMPTS=3

# 退避策略（默认 exponential_jitter）
SURREAL_COMMANDS_RETRY_WAIT_STRATEGY=exponential_jitter

# 最小等待时间（秒，默认 1）
SURREAL_COMMANDS_RETRY_WAIT_MIN=1

# 最大等待时间（秒，默认 30）
SURREAL_COMMANDS_RETRY_WAIT_MAX=30
```

---

## 7. 数据库交互

### 7.1 Command 表结构

```mermaid
erDiagram
    COMMAND {
        string id PK "command:ulid"
        string app_id "应用命名空间"
        string name "命令名称"
        string status "queued|running|completed|failed"
        object input "序列化的 CommandInput"
        object result "序列化的 CommandOutput"
        string error_message "错误信息"
        int retry_count "已重试次数"
        datetime created "创建时间"
        datetime updated "更新时间"
        object execution_metadata "执行元数据"
    }
```

### 7.2 关联引用

```mermaid
erDiagram
    SOURCE ||--o| COMMAND : "command"
    EPISODE ||--o| COMMAND : "command"

    SOURCE {
        string id PK
        string title
        record command FK "处理任务引用"
    }

    EPISODE {
        string id PK
        string name
        record command FK "生成任务引用"
    }

    COMMAND {
        string id PK
        string status
        object result
    }
```

**Domain Model 关联** (`open_notebook/domain/notebook.py`):

```python
class Source(ObjectModel):
    command: Optional[Union[str, RecordID]] = Field(
        default=None,
        description="Link to surreal-commands processing job"
    )

    async def get_status(self) -> Optional[str]:
        """通过 command 获取处理状态"""
        if not self.command:
            return None
        status = await get_command_status(str(self.command))
        return status.status if status else "unknown"

    async def vectorize(self) -> str:
        """提交向量化任务"""
        command_id = submit_command(
            "open_notebook",
            "vectorize_source",
            {"source_id": str(self.id)}
        )
        return str(command_id)
```

### 7.3 数据库操作示例

**提交命令**:
```python
# surreal-commands 内部执行
INSERT INTO command {
    app_id: "open_notebook",
    name: "embed_chunk",
    status: "queued",
    input: {
        source_id: "source:abc123",
        chunk_index: 0,
        chunk_text: "..."
    },
    created: time::now(),
    updated: time::now()
}
```

**Worker 查询待处理命令**:
```sql
SELECT * FROM command
WHERE status = "queued"
ORDER BY created ASC
LIMIT 5
```

**更新状态**:
```sql
-- 开始执行
UPDATE command:xyz SET
    status = "running",
    updated = time::now()

-- 执行完成
UPDATE command:xyz SET
    status = "completed",
    result = {...},
    updated = time::now()

-- 执行失败
UPDATE command:xyz SET
    status = "failed",
    error_message = "...",
    updated = time::now()
```

---

## 8. API 接口

### 8.1 提交命令

```http
POST /api/commands/jobs
Content-Type: application/json

{
    "app": "open_notebook",
    "command": "embed_chunk",
    "input": {
        "source_id": "source:abc123",
        "chunk_index": 0,
        "chunk_text": "Hello world"
    }
}
```

**响应**:
```json
{
    "job_id": "command:01HQ...",
    "status": "submitted",
    "message": "Command 'embed_chunk' submitted successfully"
}
```

### 8.2 查询状态

```http
GET /api/commands/jobs/{job_id}
```

**响应**:
```json
{
    "job_id": "command:01HQ...",
    "status": "completed",
    "result": {
        "success": true,
        "source_id": "source:abc123",
        "chunk_index": 0
    },
    "error_message": null,
    "created": "2024-01-15T10:30:00Z",
    "updated": "2024-01-15T10:30:05Z",
    "progress": null
}
```

### 8.3 调试注册表

```http
GET /api/commands/registry/debug
```

**响应**:
```json
{
    "total_commands": 6,
    "commands_by_app": {
        "open_notebook": [
            "embed_single_item",
            "embed_chunk",
            "vectorize_source",
            "rebuild_embeddings",
            "generate_podcast",
            "process_source"
        ]
    }
}
```

---

## 9. 编排模式

### 9.1 扇出模式（Fan-out）

`vectorize_source` 命令展示了如何将一个大任务分解为多个小任务：

```mermaid
sequenceDiagram
    participant API
    participant Orchestrator as vectorize_source
    participant DB as SurrealDB
    participant Workers as Worker Pool
    participant Chunks as embed_chunk x N

    API->>Orchestrator: submit vectorize_source
    Orchestrator->>DB: DELETE existing embeddings
    Orchestrator->>Orchestrator: split_text() → N chunks

    loop 每个 chunk
        Orchestrator->>DB: submit embed_chunk job
    end

    Orchestrator-->>API: {jobs_submitted: N}

    par 并行执行
        Workers->>Chunks: execute chunk 0
        Workers->>Chunks: execute chunk 1
        Workers->>Chunks: execute chunk 2
        Workers->>Chunks: execute chunk N
    end

    Chunks-->>DB: UPDATE completed
```

**代码实现** (`commands/embedding_commands.py:291`):

```python
@command("vectorize_source", app="open_notebook", retry=None)
async def vectorize_source_command(input_data: VectorizeSourceInput):
    # 1. 加载源文档
    source = await Source.get(input_data.source_id)

    # 2. 删除现有嵌入（幂等性）
    await repo_query("DELETE source_embedding WHERE source = $source_id", {...})

    # 3. 分割文本
    chunks = split_text(source.full_text)

    # 4. 为每个块提交独立任务
    for idx, chunk_text in enumerate(chunks):
        submit_command(
            "open_notebook",
            "embed_chunk",
            {
                "source_id": input_data.source_id,
                "chunk_index": idx,
                "chunk_text": chunk_text,
            }
        )

    # 5. 立即返回（任务在后台执行）
    return VectorizeSourceOutput(
        success=True,
        total_chunks=len(chunks),
        jobs_submitted=len(chunks),
    )
```

### 9.2 为什么编排命令禁用重试？

```python
@command("vectorize_source", app="open_notebook", retry=None)
```

| 原因 | 说明 |
|------|------|
| **快速失败** | 编排错误应立即可见 |
| **子任务有自己的重试** | embed_chunk 有独立的重试逻辑 |
| **避免重复提交** | 重试可能导致任务重复提交 |
| **调试友好** | 立即报错便于定位问题 |

---

## 10. 监控与调试

### 10.1 日志输出

```
# Worker 日志示例
INFO  Starting vectorization orchestration for source source:abc123
INFO  Deleting existing embeddings for source source:abc123
INFO  Split into 42 chunks
INFO  Submitting 42 chunk jobs to worker queue
INFO  Submitted 10/42 chunk jobs
INFO  Submitted 20/42 chunk jobs
INFO  Submitted 30/42 chunk jobs
INFO  Submitted 40/42 chunk jobs
INFO  Vectorization orchestration complete: 42/42 jobs submitted in 1.23s

# 重试日志
WARN  Transaction conflict for chunk 15 - will be retried by retry mechanism
INFO  [Retry] Attempt 2/5 for embed_chunk, waiting 2.3s
INFO  Successfully embedded chunk 15
```

### 10.2 状态轮询模式

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant DB

    Client->>API: POST /api/sources (async=true)
    API->>DB: submit vectorize_source
    API-->>Client: {command_id: "..."}

    loop 每 2 秒
        Client->>API: GET /api/commands/jobs/{id}
        API->>DB: SELECT status FROM command
        DB-->>API: {status: "running"}
        API-->>Client: {status: "running", progress: {...}}
    end

    Client->>API: GET /api/commands/jobs/{id}
    API->>DB: SELECT status FROM command
    DB-->>API: {status: "completed", result: {...}}
    API-->>Client: {status: "completed", result: {...}}
```

### 10.3 常见问题排查

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 任务卡在 queued | Worker 未启动 | 检查 supervisord 状态 |
| 大量事务冲突 | 并发过高 | 降低 MAX_TASKS |
| 重试耗尽 | 持续瞬态错误 | 增加 max_attempts 或 wait_max |
| 命令未注册 | 模块未导入 | 检查 --import-modules |

---

## 11. 总结

### 11.1 核心要点

1. **基于轮询的队列模式**：Worker 主动从 SurrealDB 拉取任务
2. **Pydantic 序列化**：Input/Output 模型自动序列化
3. **装饰器注册**：`@command()` 装饰器注册到全局 Registry
4. **可配置重试**：支持多种退避策略和异常过滤
5. **编排模式**：大任务可分解为多个小任务并行执行

### 11.2 最佳实践

| 实践 | 说明 |
|------|------|
| 使用 exponential_jitter | 避免雷群效应 |
| 区分瞬态/永久错误 | 瞬态重新抛出，永久返回失败 |
| 编排命令禁用重试 | 快速失败，子任务自己重试 |
| 关联 Domain Model | Source/Episode 存储 command 引用 |
| 监控重试率 | 高重试率说明需要调整配置 |

### 11.3 架构优势

```mermaid
mindmap
  root((Worker + SurrealDB))
    持久化
      任务不丢失
      宕机恢复
    可扩展
      多 Worker 实例
      水平扩展
    可观测
      状态查询
      进度追踪
    容错
      自动重试
      错误隔离
    简单
      单一数据源
      无额外依赖
```
