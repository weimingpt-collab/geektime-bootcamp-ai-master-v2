import logging
import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import api_router
from .config import settings
from .database import Base, engine

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# 创建应用
app = FastAPI(
    title=settings.PROJECT_NAME,
    version="0.1.0",
    description="Ticket Management System API",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url=f"{settings.API_V1_PREFIX}/docs",
    redoc_url=f"{settings.API_V1_PREFIX}/redoc",
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 请求日志中间件
@app.middleware("http")
async def log_requests(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time

    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Duration: {process_time:.4f}s"
    )

    return response


# 注册路由
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


# 健康检查
@app.get("/health")
async def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME}


# 根路径
@app.get("/")
async def root():
    return {
        "message": "Welcome to Project Alpha API",
        "docs": f"{settings.API_V1_PREFIX}/docs",
    }


# 启动事件
@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting {settings.PROJECT_NAME}")
    # 可选：创建数据库表（通常使用 Alembic）
    # Base.metadata.create_all(bind=engine)


# 关闭事件
@app.on_event("shutdown")
async def shutdown_event():
    logger.info(f"Shutting down {settings.PROJECT_NAME}")
