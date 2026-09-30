# Interview Database (interview_db)

## 概述

这是一个完整的**面试管理数据库**，模拟真实公司的招聘流程，包含从职位发布、候选人申请、面试安排、面试反馈到Offer发放的完整流程。

## 数据库统计

- **部门**: 8个（工程部、产品部、设计部、数据科学部、市场部、HR部、运营部、客户成功部）
- **职位**: 15个开放职位（高级后端、前端、全栈、iOS、DevOps、ML、数据分析、产品经理、设计师等）
- **候选人**: 50个候选人（含在职人员和实习生）
- **申请**: 51个职位申请
- **面试官**: 21个面试官
- **面试轮次配置**: 67个轮次配置
- **面试安排**: 50次面试
- **面试反馈**: 45条反馈
- **Offer**: 9个offer（包含待接受、已接受、已拒绝、已过期）
- **背景调查**: 14次背景调查
- **活动日志**: 31条操作日志

## 数据库结构 (12张表)

### 1. departments (部门表)
存储公司各部门信息
- 字段: id, name, code, manager_name, location, budget

### 2. job_positions (职位表)
存储招聘职位信息
- 字段: id, department_id, title, job_code, level, employment_type, salary范围, headcount, status, skills, description
- 职级: Junior/Mid/Senior/Lead/Principal
- 雇佣类型: Full-time/Part-time/Contract/Intern

### 3. candidates (候选人表)
存储候选人个人信息
- 字段: id, name, email, phone, current_company, years_of_experience, education, resume_url, LinkedIn, GitHub, source, expected_salary
- 来源渠道: Referral/LinkedIn/Job Board/Agency

### 4. applications (职位申请表)
记录候选人的职位申请
- 字段: id, candidate_id, job_position_id, application_date, status, current_stage, priority
- 状态: PENDING/SCREENING/INTERVIEW/OFFER/REJECTED/ACCEPTED/DECLINED
- 优先级: LOW/MEDIUM/HIGH/URGENT

### 5. interviewers (面试官表)
存储公司面试官信息
- 字段: id, name, email, department_id, title, expertise, interview_count, avg_rating

### 6. interview_rounds (面试轮次配置表)
定义每个职位的面试流程
- 字段: id, job_position_id, round_number, round_name, round_type, duration_minutes
- 轮次类型: PHONE/VIDEO/ONSITE/CODING_TEST
- 常见轮次: 电话初筛 → 技术一面 → 技术二面 → 编码测试 → 技术终面 → HR面试

### 7. interviews (面试安排表)
具体的面试时间安排
- 字段: id, application_id, interview_round_id, scheduled_date, scheduled_time, interview_type, location, meeting_link, status
- 状态: SCHEDULED/COMPLETED/CANCELLED/NO_SHOW/RESCHEDULED

### 8. interview_assignments (面试官分配表)
分配面试官到具体面试
- 字段: id, interview_id, interviewer_id, role, confirmed, feedback_submitted
- 角色: PRIMARY/SECONDARY/OBSERVER

### 9. interview_feedback (面试反馈表)
面试官的评估反馈
- 字段: id, interview_id, interviewer_id, overall_rating, technical_skills_rating, communication_rating, problem_solving_rating, cultural_fit_rating, recommendation, strengths, weaknesses
- 评分: 1-5分
- 推荐: STRONG_HIRE/HIRE/NO_HIRE/STRONG_NO_HIRE

### 10. offers (Offer表)
Offer信息
- 字段: id, application_id, offer_date, expiry_date, base_salary, bonus, equity_shares, sign_on_bonus, start_date, status, rejection_reason
- 状态: PENDING/ACCEPTED/REJECTED/WITHDRAWN/EXPIRED

### 11. background_checks (背景调查表)
候选人背景调查记录
- 字段: id, application_id, check_type, vendor, initiated_date, completed_date, status, result
- 类型: EDUCATION/EMPLOYMENT/CRIMINAL/CREDIT
- 结果: CLEAR/CONCERN/FAILED

### 12. activity_logs (活动日志表)
记录所有操作活动
- 字段: id, application_id, interview_id, activity_type, actor_name, description, old_value, new_value, created_at
- 活动类型: APPLICATION_CREATED, STATUS_CHANGED, INTERVIEW_SCHEDULED, FEEDBACK_SUBMITTED, OFFER_CREATED等

## 数据特点

### 真实性
- **真实的公司结构**: 8个部门，覆盖技术、产品、设计、数据、市场等
- **真实的招聘流程**: 从申请到offer的完整流程
- **真实的候选人背景**: 大厂背景（阿里、腾讯、字节、美团等）
- **真实的薪资范围**: 5K-60K不等，符合市场水平
- **真实的面试轮次**: 3-6轮不等，包含电话、视频、现场、编码测试

### 复杂性
- **多对多关系**: 一个候选人可以申请多个职位，一个面试可以有多个面试官
- **状态机**: 申请状态、面试状态、offer状态的流转
- **时间序列**: 从申请到入职的完整时间线
- **评分系统**: 多维度评分（技术、沟通、解决问题、文化契合）

### 丰富性
- **多种状态**: 包含进行中、已完成、已取消、未到场等各种情况
- **多种结果**: 有被录用的、被拒绝的、主动撤回的、offer过期的
- **详细反馈**: 包含优势、劣势、详细评价
- **活动日志**: 完整的操作审计轨迹

## 典型查询示例

### 1. 查看所有待发offer的候选人
```sql
SELECT
    c.first_name, c.last_name, c.email,
    c.current_company, c.years_of_experience,
    j.title as position,
    a.status
FROM candidates c
JOIN applications a ON c.id = a.candidate_id
JOIN job_positions j ON a.job_position_id = j.id
WHERE a.status = 'OFFER';
```

### 2. 查看某个职位的所有申请及当前状态
```sql
SELECT
    c.first_name, c.last_name,
    c.current_company,
    a.application_date,
    a.status,
    a.current_stage,
    a.priority
FROM applications a
JOIN candidates c ON a.candidate_id = c.id
JOIN job_positions j ON a.job_position_id = j.id
WHERE j.job_code = 'ENG-001'
ORDER BY a.application_date DESC;
```

### 3. 查看今日的面试安排
```sql
SELECT
    i.scheduled_date,
    i.scheduled_time,
    i.interview_type,
    c.first_name, c.last_name,
    j.title as position,
    ir.round_name,
    GROUP_CONCAT(CONCAT(interviewers.first_name, ' ', interviewers.last_name)) as interviewers
FROM interviews i
JOIN applications a ON i.application_id = a.id
JOIN candidates c ON a.candidate_id = c.id
JOIN job_positions j ON a.job_position_id = j.id
JOIN interview_rounds ir ON i.interview_round_id = ir.id
LEFT JOIN interview_assignments ia ON i.id = ia.interview_id
LEFT JOIN interviewers ON ia.interviewer_id = interviewers.id
WHERE i.scheduled_date = CURDATE()
  AND i.status = 'SCHEDULED'
GROUP BY i.id
ORDER BY i.scheduled_time;
```

### 4. 统计各职位的申请情况
```sql
SELECT
    d.name as department,
    j.title as position,
    j.headcount as target,
    COUNT(DISTINCT a.id) as total_applications,
    SUM(CASE WHEN a.status = 'SCREENING' THEN 1 ELSE 0 END) as screening,
    SUM(CASE WHEN a.status = 'INTERVIEW' THEN 1 ELSE 0 END) as interviewing,
    SUM(CASE WHEN a.status = 'OFFER' THEN 1 ELSE 0 END) as offered,
    SUM(CASE WHEN a.status = 'ACCEPTED' THEN 1 ELSE 0 END) as accepted
FROM job_positions j
JOIN departments d ON j.department_id = d.id
LEFT JOIN applications a ON j.id = a.job_position_id
WHERE j.status = 'OPEN'
GROUP BY j.id
ORDER BY d.name, j.title;
```

### 5. 查看强推荐(STRONG_HIRE)的候选人
```sql
SELECT
    c.first_name, c.last_name,
    c.current_company,
    c.years_of_experience,
    j.title as position,
    AVG(f.overall_rating) as avg_rating,
    COUNT(DISTINCT f.id) as feedback_count,
    SUM(CASE WHEN f.recommendation = 'STRONG_HIRE' THEN 1 ELSE 0 END) as strong_hire_count
FROM candidates c
JOIN applications a ON c.id = a.candidate_id
JOIN job_positions j ON a.job_position_id = j.id
JOIN interviews i ON a.id = i.application_id
JOIN interview_feedback f ON i.id = f.interview_id
GROUP BY c.id, j.id
HAVING strong_hire_count > 0
ORDER BY avg_rating DESC, strong_hire_count DESC;
```

### 6. 分析面试官的评分分布
```sql
SELECT
    interviewers.first_name,
    interviewers.last_name,
    interviewers.title,
    COUNT(f.id) as total_interviews,
    AVG(f.overall_rating) as avg_rating,
    SUM(CASE WHEN f.recommendation = 'STRONG_HIRE' THEN 1 ELSE 0 END) as strong_hire,
    SUM(CASE WHEN f.recommendation = 'HIRE' THEN 1 ELSE 0 END) as hire,
    SUM(CASE WHEN f.recommendation = 'NO_HIRE' THEN 1 ELSE 0 END) as no_hire,
    SUM(CASE WHEN f.recommendation = 'STRONG_NO_HIRE' THEN 1 ELSE 0 END) as strong_no_hire
FROM interviewers
LEFT JOIN interview_feedback f ON interviewers.id = f.interviewer_id
GROUP BY interviewers.id
HAVING total_interviews > 0
ORDER BY total_interviews DESC;
```

### 7. 计算从申请到offer的平均周期
```sql
SELECT
    j.title as position,
    AVG(DATEDIFF(o.offer_date, a.application_date)) as avg_days_to_offer,
    COUNT(*) as offer_count
FROM offers o
JOIN applications a ON o.application_id = a.id
JOIN job_positions j ON a.job_position_id = j.id
WHERE o.status IN ('PENDING', 'ACCEPTED')
GROUP BY j.id
ORDER BY avg_days_to_offer;
```

### 8. 查看候选人的完整面试历程
```sql
SELECT
    c.first_name, c.last_name,
    j.title as position,
    ir.round_name,
    i.scheduled_date,
    i.interview_type,
    i.status as interview_status,
    GROUP_CONCAT(CONCAT(interviewers.first_name, ' ', interviewers.last_name)) as interviewers,
    AVG(f.overall_rating) as avg_rating,
    GROUP_CONCAT(DISTINCT f.recommendation) as recommendations
FROM candidates c
JOIN applications a ON c.id = a.candidate_id
JOIN job_positions j ON a.job_position_id = j.id
JOIN interviews i ON a.id = i.application_id
JOIN interview_rounds ir ON i.interview_round_id = ir.id
LEFT JOIN interview_assignments ia ON i.id = ia.interview_id
LEFT JOIN interviewers ON ia.interviewer_id = interviewers.id
LEFT JOIN interview_feedback f ON i.id = f.interview_id AND f.interviewer_id = interviewers.id
WHERE c.id = 3  -- 王磊（候选人3）
GROUP BY i.id
ORDER BY ir.round_number;
```

### 9. 候选人来源渠道分析
```sql
SELECT
    c.source,
    COUNT(DISTINCT c.id) as candidate_count,
    COUNT(DISTINCT a.id) as application_count,
    SUM(CASE WHEN a.status = 'ACCEPTED' THEN 1 ELSE 0 END) as hired_count,
    ROUND(SUM(CASE WHEN a.status = 'ACCEPTED' THEN 1 ELSE 0 END) * 100.0 / COUNT(DISTINCT a.id), 2) as conversion_rate
FROM candidates c
LEFT JOIN applications a ON c.id = a.candidate_id
GROUP BY c.source
ORDER BY hired_count DESC;
```

### 10. 部门招聘预算使用情况
```sql
SELECT
    d.name as department,
    d.budget as total_budget,
    SUM(o.base_salary * 12 + COALESCE(o.bonus, 0) + COALESCE(o.sign_on_bonus, 0)) as committed_amount,
    COUNT(o.id) as offer_count,
    d.budget - SUM(o.base_salary * 12 + COALESCE(o.bonus, 0) + COALESCE(o.sign_on_bonus, 0)) as remaining_budget
FROM departments d
LEFT JOIN job_positions j ON d.id = j.department_id
LEFT JOIN applications a ON j.id = a.job_position_id
LEFT JOIN offers o ON a.id = o.application_id
WHERE o.status IN ('PENDING', 'ACCEPTED') OR o.id IS NULL
GROUP BY d.id
ORDER BY d.budget DESC;
```

## 使用场景

### 1. 学习SQL查询
- JOIN多表关联
- GROUP BY聚合统计
- 子查询和CTE
- 窗口函数
- 日期时间处理

### 2. 数据分析
- 招聘漏斗分析
- 候选人转化率
- 面试周期分析
- 面试官效率分析
- 薪资分布分析

### 3. 应用开发
- 招聘管理系统
- ATS (Applicant Tracking System)
- 面试调度系统
- HR报表系统

### 4. 自然语言查询测试
- 测试NL2SQL系统
- 中英文查询
- 复杂业务逻辑理解

## 中文自然语言查询示例

1. "查询所有等待发offer的候选人"
2. "统计每个职位收到的申请数量"
3. "找出所有被强烈推荐的候选人"
4. "查看本月的面试安排"
5. "分析各个渠道的候选人转化率"
6. "查询工程部的招聘预算使用情况"
7. "列出所有已接受offer但还未入职的候选人"
8. "找出面试评分最高的5个候选人"
9. "统计每个面试官今年面试的人数"
10. "查询阿里巴巴背景的候选人申请情况"

## 安装和使用

### 创建数据库
```bash
cd /path/to/scripts
./setup_interview_db.sh
```

### 访问数据库
```bash
mysql -u root interview_db
```

### 重新创建（清空重建）
```bash
mysql -u root < create_interview_db.sql
mysql -u root < seed_interview_data.sql
mysql -u root < seed_interview_data_part2.sql
mysql -u root < seed_interview_data_part3.sql
```

## 数据库设计亮点

1. **完整的外键约束**: 保证数据一致性
2. **合理的索引设计**: 优化查询性能
3. **灵活的状态机**: 支持复杂的业务流程
4. **审计日志**: activity_logs记录所有操作
5. **时间戳**: 每张表都有created_at和updated_at
6. **软删除支持**: 通过status字段实现
7. **多对多关系**: 面试和面试官的灵活分配
8. **评分系统**: 多维度量化评估

## 扩展建议

如需扩展数据库，可以考虑添加：
1. **面试题库表**: 存储面试问题
2. **候选人技能表**: 技能标签系统
3. **面试笔记表**: 详细的面试记录
4. **简历解析表**: 简历内容结构化
5. **推荐人表**: 内推关系管理
6. **offer谈判表**: 薪资谈判历史
7. **入职表**: onboarding流程
8. **绩效表**: 入职后表现追踪

## 注意事项

1. 数据为测试数据，姓名、公司等信息均为虚构
2. 薪资数字仅供参考，不代表真实市场水平
3. 邮箱地址为示例地址，不可用于实际发送
4. 电话号码为虚构号码
5. 面试反馈内容为示例，实际场景需更详细

## License

本数据库设计用于学习和测试目的，可自由使用和修改。
