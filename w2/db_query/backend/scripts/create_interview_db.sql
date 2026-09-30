-- Interview Management Database
-- 面试管理数据库：记录公司招聘、面试安排、面试结果等信息

DROP DATABASE IF EXISTS interview_db;
CREATE DATABASE interview_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE interview_db;

-- 1. 部门表
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '部门名称',
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '部门代码',
    manager_name VARCHAR(100) COMMENT '部门经理',
    location VARCHAR(100) COMMENT '办公地点',
    budget DECIMAL(15, 2) COMMENT '招聘预算',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code)
) COMMENT '部门信息表';

-- 2. 职位表
CREATE TABLE job_positions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_id INT NOT NULL,
    title VARCHAR(200) NOT NULL COMMENT '职位标题',
    job_code VARCHAR(50) NOT NULL UNIQUE COMMENT '职位编号',
    level VARCHAR(50) NOT NULL COMMENT '职级 (Junior/Mid/Senior/Lead/Principal)',
    employment_type VARCHAR(50) NOT NULL COMMENT '雇佣类型 (Full-time/Part-time/Contract/Intern)',
    min_salary DECIMAL(12, 2) COMMENT '最低薪资',
    max_salary DECIMAL(12, 2) COMMENT '最高薪资',
    headcount INT DEFAULT 1 COMMENT '招聘人数',
    status VARCHAR(50) DEFAULT 'OPEN' COMMENT '状态 (OPEN/CLOSED/ON_HOLD)',
    required_skills TEXT COMMENT '必备技能',
    preferred_skills TEXT COMMENT '优选技能',
    description TEXT COMMENT '职位描述',
    posted_date DATE COMMENT '发布日期',
    close_date DATE COMMENT '关闭日期',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    INDEX idx_status (status),
    INDEX idx_department (department_id),
    INDEX idx_job_code (job_code)
) COMMENT '职位信息表';

-- 3. 候选人表
CREATE TABLE candidates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL COMMENT '名',
    last_name VARCHAR(100) NOT NULL COMMENT '姓',
    email VARCHAR(200) NOT NULL UNIQUE COMMENT '邮箱',
    phone VARCHAR(50) COMMENT '电话',
    current_company VARCHAR(200) COMMENT '当前公司',
    current_title VARCHAR(200) COMMENT '当前职位',
    years_of_experience DECIMAL(4, 2) COMMENT '工作年限',
    education_level VARCHAR(50) COMMENT '学历 (Bachelor/Master/PhD)',
    university VARCHAR(200) COMMENT '毕业院校',
    major VARCHAR(200) COMMENT '专业',
    resume_url VARCHAR(500) COMMENT '简历链接',
    linkedin_url VARCHAR(500) COMMENT 'LinkedIn链接',
    github_url VARCHAR(500) COMMENT 'GitHub链接',
    source VARCHAR(100) COMMENT '来源渠道 (Referral/LinkedIn/Job Board/Agency)',
    status VARCHAR(50) DEFAULT 'ACTIVE' COMMENT '状态 (ACTIVE/HIRED/REJECTED/WITHDRAWN)',
    location VARCHAR(200) COMMENT '所在地',
    expected_salary DECIMAL(12, 2) COMMENT '期望薪资',
    notice_period_days INT COMMENT '离职通知期(天)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_source (source)
) COMMENT '候选人信息表';

-- 4. 职位申请表
CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT NOT NULL,
    job_position_id INT NOT NULL,
    application_date DATE NOT NULL COMMENT '申请日期',
    status VARCHAR(50) DEFAULT 'PENDING' COMMENT '状态 (PENDING/SCREENING/INTERVIEW/OFFER/REJECTED/ACCEPTED/DECLINED)',
    current_stage VARCHAR(100) COMMENT '当前阶段',
    resume_version VARCHAR(50) COMMENT '简历版本',
    cover_letter TEXT COMMENT '求职信',
    referrer_name VARCHAR(100) COMMENT '推荐人',
    priority VARCHAR(50) DEFAULT 'MEDIUM' COMMENT '优先级 (LOW/MEDIUM/HIGH/URGENT)',
    notes TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id),
    FOREIGN KEY (job_position_id) REFERENCES job_positions(id),
    INDEX idx_status (status),
    INDEX idx_candidate (candidate_id),
    INDEX idx_job (job_position_id),
    INDEX idx_application_date (application_date),
    UNIQUE KEY unique_application (candidate_id, job_position_id)
) COMMENT '职位申请表';

-- 5. 面试官表
CREATE TABLE interviewers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    department_id INT,
    title VARCHAR(200) COMMENT '职位',
    expertise TEXT COMMENT '专长领域',
    interview_count INT DEFAULT 0 COMMENT '面试次数',
    avg_rating DECIMAL(3, 2) COMMENT '平均评分',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否在职',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    INDEX idx_email (email),
    INDEX idx_department (department_id),
    INDEX idx_active (is_active)
) COMMENT '面试官信息表';

-- 6. 面试轮次配置表
CREATE TABLE interview_rounds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_position_id INT NOT NULL,
    round_number INT NOT NULL COMMENT '轮次编号',
    round_name VARCHAR(100) NOT NULL COMMENT '轮次名称 (Phone Screen/Technical/Behavioral/Final)',
    round_type VARCHAR(50) NOT NULL COMMENT '面试类型 (PHONE/VIDEO/ONSITE/CODING_TEST)',
    duration_minutes INT DEFAULT 60 COMMENT '时长(分钟)',
    is_required BOOLEAN DEFAULT TRUE COMMENT '是否必需',
    description TEXT COMMENT '轮次说明',
    evaluation_criteria TEXT COMMENT '评估标准',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_position_id) REFERENCES job_positions(id),
    INDEX idx_job_position (job_position_id),
    UNIQUE KEY unique_round (job_position_id, round_number)
) COMMENT '面试轮次配置表';

-- 7. 面试安排表
CREATE TABLE interviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    interview_round_id INT NOT NULL,
    scheduled_date DATE NOT NULL COMMENT '面试日期',
    scheduled_time TIME NOT NULL COMMENT '面试时间',
    end_time TIME COMMENT '结束时间',
    timezone VARCHAR(50) DEFAULT 'Asia/Shanghai' COMMENT '时区',
    interview_type VARCHAR(50) NOT NULL COMMENT '面试方式 (PHONE/VIDEO/ONSITE/CODING_TEST)',
    location VARCHAR(200) COMMENT '地点/会议室',
    meeting_link VARCHAR(500) COMMENT '视频会议链接',
    status VARCHAR(50) DEFAULT 'SCHEDULED' COMMENT '状态 (SCHEDULED/COMPLETED/CANCELLED/NO_SHOW/RESCHEDULED)',
    cancellation_reason TEXT COMMENT '取消原因',
    notes TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id),
    FOREIGN KEY (interview_round_id) REFERENCES interview_rounds(id),
    INDEX idx_application (application_id),
    INDEX idx_round (interview_round_id),
    INDEX idx_scheduled_date (scheduled_date),
    INDEX idx_status (status)
) COMMENT '面试安排表';

-- 8. 面试官分配表
CREATE TABLE interview_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    interview_id INT NOT NULL,
    interviewer_id INT NOT NULL,
    role VARCHAR(50) DEFAULT 'INTERVIEWER' COMMENT '角色 (PRIMARY/SECONDARY/OBSERVER)',
    confirmed BOOLEAN DEFAULT FALSE COMMENT '是否确认',
    feedback_submitted BOOLEAN DEFAULT FALSE COMMENT '是否已提交反馈',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (interview_id) REFERENCES interviews(id),
    FOREIGN KEY (interviewer_id) REFERENCES interviewers(id),
    INDEX idx_interview (interview_id),
    INDEX idx_interviewer (interviewer_id),
    UNIQUE KEY unique_assignment (interview_id, interviewer_id)
) COMMENT '面试官分配表';

-- 9. 面试反馈表
CREATE TABLE interview_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    interview_id INT NOT NULL,
    interviewer_id INT NOT NULL,
    overall_rating INT CHECK (overall_rating BETWEEN 1 AND 5) COMMENT '总体评分 1-5',
    technical_skills_rating INT CHECK (technical_skills_rating BETWEEN 1 AND 5) COMMENT '技术能力评分',
    communication_rating INT CHECK (communication_rating BETWEEN 1 AND 5) COMMENT '沟通能力评分',
    problem_solving_rating INT CHECK (problem_solving_rating BETWEEN 1 AND 5) COMMENT '解决问题能力评分',
    cultural_fit_rating INT CHECK (cultural_fit_rating BETWEEN 1 AND 5) COMMENT '文化契合度评分',
    recommendation VARCHAR(50) NOT NULL COMMENT '推荐 (STRONG_HIRE/HIRE/NO_HIRE/STRONG_NO_HIRE)',
    strengths TEXT COMMENT '优势',
    weaknesses TEXT COMMENT '劣势',
    detailed_feedback TEXT COMMENT '详细反馈',
    questions_asked TEXT COMMENT '提问的问题',
    candidate_questions TEXT COMMENT '候选人的问题',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (interview_id) REFERENCES interviews(id),
    FOREIGN KEY (interviewer_id) REFERENCES interviewers(id),
    INDEX idx_interview (interview_id),
    INDEX idx_interviewer (interviewer_id),
    INDEX idx_rating (overall_rating),
    INDEX idx_recommendation (recommendation)
) COMMENT '面试反馈表';

-- 10. Offer表
CREATE TABLE offers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    offer_date DATE NOT NULL COMMENT 'Offer发出日期',
    expiry_date DATE NOT NULL COMMENT 'Offer过期日期',
    base_salary DECIMAL(12, 2) NOT NULL COMMENT '基本工资',
    bonus DECIMAL(12, 2) COMMENT '奖金',
    equity_shares INT COMMENT '股票数量',
    sign_on_bonus DECIMAL(12, 2) COMMENT '签字费',
    relocation_package DECIMAL(12, 2) COMMENT '搬家费',
    benefits_package TEXT COMMENT '福利包',
    start_date DATE COMMENT '入职日期',
    status VARCHAR(50) DEFAULT 'PENDING' COMMENT '状态 (PENDING/ACCEPTED/REJECTED/WITHDRAWN/EXPIRED)',
    response_date DATE COMMENT '回复日期',
    rejection_reason TEXT COMMENT '拒绝原因',
    notes TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id),
    INDEX idx_application (application_id),
    INDEX idx_status (status),
    INDEX idx_offer_date (offer_date)
) COMMENT 'Offer表';

-- 11. 背景调查表
CREATE TABLE background_checks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    check_type VARCHAR(100) NOT NULL COMMENT '调查类型 (EDUCATION/EMPLOYMENT/CRIMINAL/CREDIT)',
    vendor VARCHAR(200) COMMENT '第三方机构',
    initiated_date DATE NOT NULL COMMENT '发起日期',
    completed_date DATE COMMENT '完成日期',
    status VARCHAR(50) DEFAULT 'PENDING' COMMENT '状态 (PENDING/IN_PROGRESS/COMPLETED/FAILED)',
    result VARCHAR(50) COMMENT '结果 (CLEAR/CONCERN/FAILED)',
    details TEXT COMMENT '详细信息',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id),
    INDEX idx_application (application_id),
    INDEX idx_status (status)
) COMMENT '背景调查表';

-- 12. 活动日志表
CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT,
    interview_id INT,
    activity_type VARCHAR(100) NOT NULL COMMENT '活动类型',
    actor_name VARCHAR(200) COMMENT '操作人',
    actor_email VARCHAR(200) COMMENT '操作人邮箱',
    description TEXT COMMENT '描述',
    old_value VARCHAR(500) COMMENT '旧值',
    new_value VARCHAR(500) COMMENT '新值',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id),
    FOREIGN KEY (interview_id) REFERENCES interviews(id),
    INDEX idx_application (application_id),
    INDEX idx_interview (interview_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_created_at (created_at)
) COMMENT '活动日志表';
