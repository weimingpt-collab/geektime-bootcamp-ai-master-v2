-- Project Alpha Seed Data
-- 包含 50 个有意义的 tickets 和多个 tags
-- 执行方式: psql -U postgres -d projectalpha -f seed.sql
-- 清理现有数据（可选，谨慎使用）
-- TRUNCATE TABLE ticket_tags CASCADE;
-- TRUNCATE TABLE tickets CASCADE;
-- TRUNCATE TABLE tags CASCADE;
-- ============================================
-- 插入 Tags
-- ============================================
-- Platform Tags
INSERT INTO tags(name, color, created_at)
  VALUES ('ios', '#000000', CURRENT_TIMESTAMP),
('android', '#3DDC84', CURRENT_TIMESTAMP),
('web', '#4285F4', CURRENT_TIMESTAMP),
('desktop', '#757575', CURRENT_TIMESTAMP),
('api', '#FF6B6B', CURRENT_TIMESTAMP);

-- Project Tags
INSERT INTO tags(name, color, created_at)
  VALUES ('viking', '#8B4513', CURRENT_TIMESTAMP),
('atlas', '#1E90FF', CURRENT_TIMESTAMP),
('phoenix', '#FF4500', CURRENT_TIMESTAMP),
('nexus', '#9370DB', CURRENT_TIMESTAMP),
('aurora', '#00CED1', CURRENT_TIMESTAMP);

-- Functional Tags
INSERT INTO tags(name, color, created_at)
  VALUES ('autocomplete', '#FFD700', CURRENT_TIMESTAMP),
('search', '#32CD32', CURRENT_TIMESTAMP),
('authentication', '#FF6347', CURRENT_TIMESTAMP),
('authorization', '#FF1493', CURRENT_TIMESTAMP),
('caching', '#00BFFF', CURRENT_TIMESTAMP),
('logging', '#FFA500', CURRENT_TIMESTAMP),
('monitoring', '#FF69B4', CURRENT_TIMESTAMP),
('analytics', '#9370DB', CURRENT_TIMESTAMP),
('notifications', '#20B2AA', CURRENT_TIMESTAMP),
('payments', '#228B22', CURRENT_TIMESTAMP);

-- Feature Tags
INSERT INTO tags(name, color, created_at)
  VALUES ('ui', '#FF6B9D', CURRENT_TIMESTAMP),
('ux', '#C44569', CURRENT_TIMESTAMP),
('performance', '#F8B500', CURRENT_TIMESTAMP),
('security', '#C0392B', CURRENT_TIMESTAMP),
('accessibility', '#27AE60', CURRENT_TIMESTAMP),
('i18n', '#3498DB', CURRENT_TIMESTAMP),
('dark-mode', '#2C3E50', CURRENT_TIMESTAMP),
('responsive', '#E74C3C', CURRENT_TIMESTAMP);

-- Priority Tags
INSERT INTO tags(name, color, created_at)
  VALUES ('critical', '#DC143C', CURRENT_TIMESTAMP),
('high', '#FF4500', CURRENT_TIMESTAMP),
('medium', '#FFA500', CURRENT_TIMESTAMP),
('low', '#90EE90', CURRENT_TIMESTAMP);

-- Type Tags
INSERT INTO tags(name, color, created_at)
  VALUES ('bug', '#EF4444', CURRENT_TIMESTAMP),
('feature', '#8B5CF6', CURRENT_TIMESTAMP),
('enhancement', '#3B82F6', CURRENT_TIMESTAMP),
('refactor', '#10B981', CURRENT_TIMESTAMP),
('documentation', '#6366F1', CURRENT_TIMESTAMP),
('test', '#EC4899', CURRENT_TIMESTAMP);

-- ============================================
-- 插入 Tickets
-- ============================================
-- iOS Tickets
INSERT INTO tickets(title, description, status, created_at, updated_at, completed_at)
  VALUES ('实现 iOS 深色模式支持', '为 iOS 应用添加深色模式主题，包括所有屏幕和组件的适配', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('修复 iOS 键盘遮挡输入框问题', '在 iOS 设备上，键盘弹出时会遮挡输入框，需要调整布局', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('优化 iOS 应用启动速度', '应用启动时间超过 3 秒，需要优化启动流程和资源加载', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('iOS 推送通知集成', '集成 Firebase Cloud Messaging，实现推送通知功能', 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day'),
('iOS 应用内购买功能', '实现应用内购买流程，包括商品展示、购买和收据验证', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);

-- Android Tickets
INSERT INTO tickets(title, description, status, created_at, updated_at, completed_at)
  VALUES ('Android 12 适配', '适配 Android 12 的新特性，包括 Material You 设计语言', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('修复 Android 内存泄漏', '在长时间使用后应用内存占用持续增长，需要定位并修复泄漏', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('Android 后台任务优化', '优化后台任务执行，减少电池消耗', 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),
('Android 多语言支持', '添加中文、日文、韩文等多语言支持', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('Android 无障碍功能增强', '改进屏幕阅读器支持，添加更多无障碍标签', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);

-- Web Tickets
INSERT INTO tickets(title, description, status, created_at, updated_at, completed_at)
  VALUES ('实现响应式导航栏', '创建适配移动端和桌面端的响应式导航栏组件', 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP - INTERVAL '6 days', CURRENT_TIMESTAMP - INTERVAL '6 days'),
('Web 搜索功能优化', '优化搜索算法，提高搜索结果的准确性和相关性', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('添加自动完成功能', '在搜索框和表单输入中添加自动完成建议', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('Web 性能监控集成', '集成性能监控工具，追踪页面加载时间和用户交互延迟', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('实现单页应用路由', '使用 React Router 实现客户端路由，支持浏览器前进后退', 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '9 days', CURRENT_TIMESTAMP - INTERVAL '9 days'),
('Web 缓存策略优化', '优化静态资源缓存策略，减少服务器负载', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('添加 PWA 支持', '将 Web 应用转换为 Progressive Web App，支持离线访问', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);

-- Authentication & Security Tickets
INSERT INTO tickets(title, description, status, created_at, updated_at, completed_at)
  VALUES ('实现 OAuth 2.0 登录', '集成 Google、GitHub 等第三方登录服务', 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '4 days', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days'),
('添加双因素认证', '为用户账户添加 2FA 支持，提高安全性', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('实现 JWT 刷新令牌机制', '添加刷新令牌功能，延长用户会话时间', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('密码强度验证增强', '改进密码强度检查，添加更多安全规则', 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '8 days', CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP - INTERVAL '7 days'),
('API 速率限制实现', '为 API 端点添加速率限制，防止滥用', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('SQL 注入防护检查', '审查所有数据库查询，确保没有 SQL 注入漏洞', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);

-- Project Specific Tickets (Viking)
INSERT INTO tickets(title, description, status, created_at, updated_at, completed_at)
  VALUES ('Viking 项目数据迁移', '将 Viking 项目的数据迁移到新数据库架构', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('Viking API 端点重构', '重构 Viking 项目的 API 端点，统一响应格式', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('Viking 用户权限系统', '实现 Viking 项目的角色和权限管理系统', 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '6 days', CURRENT_TIMESTAMP - INTERVAL '4 days', CURRENT_TIMESTAMP - INTERVAL '4 days'),
('Viking 数据分析仪表板', '创建 Viking 项目的数据分析和可视化仪表板', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);

-- Project Specific Tickets (Atlas)
INSERT INTO tickets(title, description, status, created_at, updated_at, completed_at)
  VALUES ('Atlas 地图组件开发', '开发交互式地图组件，支持标记和缩放', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('Atlas 位置服务集成', '集成地理位置服务，实现位置搜索和导航', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('Atlas 离线地图支持', '添加离线地图下载和缓存功能', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);

-- Analytics & Monitoring Tickets
INSERT INTO tickets(title, description, status, created_at, updated_at, completed_at)
  VALUES ('用户行为分析集成', '集成 Google Analytics，追踪用户行为和转化率', 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '9 days', CURRENT_TIMESTAMP - INTERVAL '8 days', CURRENT_TIMESTAMP - INTERVAL '8 days'),
('错误日志聚合系统', '实现集中式错误日志收集和分析系统', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('性能指标监控', '添加应用性能指标监控，包括响应时间和吞吐量', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('A/B 测试框架', '实现 A/B 测试框架，支持功能实验和数据分析', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);

-- Notifications & Payments Tickets
INSERT INTO tickets(title, description, status, created_at, updated_at, completed_at)
  VALUES ('邮件通知系统', '实现邮件通知服务，支持模板和批量发送', 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '11 days', CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '10 days'),
('实时通知推送', '实现 WebSocket 实时通知推送功能', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('支付网关集成', '集成 Stripe 支付网关，支持信用卡和 PayPal', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('订阅管理功能', '实现用户订阅管理和自动续费功能', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('发票生成系统', '自动生成和发送发票给付费用户', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);

-- UI/UX Tickets
INSERT INTO tickets(title, description, status, created_at, updated_at, completed_at)
  VALUES ('设计系统组件库', '创建统一的设计系统组件库，提高开发效率', 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '12 days', CURRENT_TIMESTAMP - INTERVAL '11 days', CURRENT_TIMESTAMP - INTERVAL '11 days'),
('移动端手势支持', '添加滑动、长按等手势操作支持', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('加载状态优化', '改进加载状态的视觉反馈，添加骨架屏', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('表单验证提示', '改进表单验证错误提示的显示方式', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('动画效果优化', '添加页面过渡和交互动画，提升用户体验', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);

-- Documentation & Testing Tickets
INSERT INTO tickets(title, description, status, created_at, updated_at, completed_at)
  VALUES ('API 文档生成', '使用 Swagger/OpenAPI 自动生成 API 文档', 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '13 days', CURRENT_TIMESTAMP - INTERVAL '12 days', CURRENT_TIMESTAMP - INTERVAL '12 days'),
('单元测试覆盖率提升', '将单元测试覆盖率提升到 80% 以上', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('集成测试套件', '创建端到端集成测试套件', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('开发者文档更新', '更新开发者文档，添加新功能和最佳实践', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);

-- Additional Tickets
INSERT INTO tickets(title, description, status, created_at, updated_at, completed_at)
  VALUES ('数据库查询性能优化', '优化慢查询，添加必要的索引，提升数据库响应速度', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('CDN 集成和静态资源优化', '集成 CDN 服务，优化静态资源加载速度', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);

-- ============================================
-- 建立 Ticket-Tag 关联关系
-- ============================================
-- iOS Tickets 关联
INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = '实现 iOS 深色模式支持'
  AND tag.name IN ('ios', 'ui', 'dark-mode', 'feature');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = '修复 iOS 键盘遮挡输入框问题'
  AND tag.name IN ('ios', 'bug', 'ui', 'high');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = '优化 iOS 应用启动速度'
  AND tag.name IN ('ios', 'performance', 'enhancement', 'high');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = 'iOS 推送通知集成'
  AND tag.name IN ('ios', 'notifications', 'feature');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = 'iOS 应用内购买功能'
  AND tag.name IN ('ios', 'payments', 'feature', 'high');

-- Android Tickets 关联
INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = 'Android 12 适配'
  AND tag.name IN ('android', 'ui', 'enhancement', 'high');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = '修复 Android 内存泄漏'
  AND tag.name IN ('android', 'bug', 'performance', 'critical');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = 'Android 后台任务优化'
  AND tag.name IN ('android', 'performance', 'enhancement');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = 'Android 多语言支持'
  AND tag.name IN ('android', 'i18n', 'feature');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = 'Android 无障碍功能增强'
  AND tag.name IN ('android', 'accessibility', 'enhancement');

-- Web Tickets 关联
INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = '实现响应式导航栏'
  AND tag.name IN ('web', 'ui', 'responsive', 'feature');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = 'Web 搜索功能优化'
  AND tag.name IN ('web', 'search', 'enhancement', 'performance');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = '添加自动完成功能'
  AND tag.name IN ('web', 'autocomplete', 'feature', 'ux');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = 'Web 性能监控集成'
  AND tag.name IN ('web', 'monitoring', 'analytics', 'feature');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = '实现单页应用路由'
  AND tag.name IN ('web', 'feature', 'refactor');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = 'Web 缓存策略优化'
  AND tag.name IN ('web', 'caching', 'performance', 'enhancement');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = '添加 PWA 支持'
  AND tag.name IN ('web', 'feature', 'enhancement', 'high');

-- Authentication & Security Tickets 关联
INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = '实现 OAuth 2.0 登录'
  AND tag.name IN ('authentication', 'api', 'feature', 'security');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = '添加双因素认证'
  AND tag.name IN ('authentication', 'security', 'feature', 'high');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = '实现 JWT 刷新令牌机制'
  AND tag.name IN ('authentication', 'api', 'enhancement', 'security');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = '密码强度验证增强'
  AND tag.name IN ('authentication', 'security', 'enhancement');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = 'API 速率限制实现'
  AND tag.name IN ('api', 'security', 'feature', 'high');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = 'SQL 注入防护检查'
  AND tag.name IN ('security', 'bug', 'critical', 'api');

-- Viking Project Tickets 关联
INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = 'Viking 项目数据迁移'
  AND tag.name IN ('viking', 'refactor', 'high');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = 'Viking API 端点重构'
  AND tag.name IN ('viking', 'api', 'refactor', 'enhancement');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = 'Viking 用户权限系统'
  AND tag.name IN ('viking', 'authorization', 'feature');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = 'Viking 数据分析仪表板'
  AND tag.name IN ('viking', 'analytics', 'ui', 'feature');

-- Atlas Project Tickets 关联
INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = 'Atlas 地图组件开发'
  AND tag.name IN ('atlas', 'ui', 'feature', 'high');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = 'Atlas 位置服务集成'
  AND tag.name IN ('atlas', 'api', 'feature', 'high');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = 'Atlas 离线地图支持'
  AND tag.name IN ('atlas', 'caching', 'feature', 'enhancement');

-- Analytics & Monitoring Tickets 关联
INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = '用户行为分析集成'
  AND tag.name IN ('analytics', 'web', 'feature');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = '错误日志聚合系统'
  AND tag.name IN ('logging', 'monitoring', 'feature', 'high');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = '性能指标监控'
  AND tag.name IN ('monitoring', 'performance', 'analytics', 'feature');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = 'A/B 测试框架'
  AND tag.name IN ('analytics', 'feature', 'enhancement', 'high');

-- Notifications & Payments Tickets 关联
INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = '邮件通知系统'
  AND tag.name IN ('notifications', 'api', 'feature');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = '实时通知推送'
  AND tag.name IN ('notifications', 'api', 'feature', 'high');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = '支付网关集成'
  AND tag.name IN ('payments', 'api', 'feature', 'critical');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = '订阅管理功能'
  AND tag.name IN ('payments', 'feature', 'high');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = '发票生成系统'
  AND tag.name IN ('payments', 'feature', 'enhancement');

-- UI/UX Tickets 关联
INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = '设计系统组件库'
  AND tag.name IN ('ui', 'ux', 'feature', 'refactor');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = '移动端手势支持'
  AND tag.name IN ('ui', 'ux', 'feature', 'enhancement');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = '加载状态优化'
  AND tag.name IN ('ui', 'ux', 'enhancement');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = '表单验证提示'
  AND tag.name IN ('ui', 'ux', 'enhancement');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = '动画效果优化'
  AND tag.name IN ('ui', 'ux', 'enhancement', 'performance');

-- Documentation & Testing Tickets 关联
INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = 'API 文档生成'
  AND tag.name IN ('documentation', 'api', 'feature');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = '单元测试覆盖率提升'
  AND tag.name IN ('test', 'enhancement', 'high');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = '集成测试套件'
  AND tag.name IN ('test', 'feature', 'high');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = '开发者文档更新'
  AND tag.name IN ('documentation', 'enhancement');

-- Additional Tickets 关联
INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = '数据库查询性能优化'
  AND tag.name IN ('performance', 'enhancement', 'api', 'high');

INSERT INTO ticket_tags(ticket_id, tag_id, created_at)
SELECT
  t.id,
  tag.id,
  CURRENT_TIMESTAMP
FROM
  tickets t,
  tags tag
WHERE
  t.title = 'CDN 集成和静态资源优化'
  AND tag.name IN ('web', 'performance', 'caching', 'enhancement');

-- ============================================
-- 验证数据
-- ============================================
-- 显示统计信息
SELECT
  'Tags count:' AS info,
  COUNT(*) AS count
FROM
  tags;

SELECT
  'Tickets count:' AS info,
  COUNT(*) AS count
FROM
  tickets;

SELECT
  'Ticket-Tag relations:' AS info,
  COUNT(*) AS count
FROM
  ticket_tags;

SELECT
  'Pending tickets:' AS info,
  COUNT(*) AS count
FROM
  tickets
WHERE
  status = 'PENDING';

SELECT
  'Completed tickets:' AS info,
  COUNT(*) AS count
FROM
  tickets
WHERE
  status = 'COMPLETED';
