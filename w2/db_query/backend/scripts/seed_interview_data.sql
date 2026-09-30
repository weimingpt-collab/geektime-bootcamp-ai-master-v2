-- Seed Data for Interview Management Database
-- 为面试管理数据库添加丰富的测试数据

USE interview_db;

-- 1. 部门数据
INSERT INTO departments (name, code, manager_name, location, budget) VALUES
('工程部', 'ENG', '张伟', '北京', 5000000.00),
('产品部', 'PROD', '李娜', '上海', 2000000.00),
('设计部', 'DESIGN', '王芳', '深圳', 1000000.00),
('数据科学部', 'DS', '刘强', '北京', 3000000.00),
('市场部', 'MKT', '陈静', '上海', 1500000.00),
('人力资源部', 'HR', '赵敏', '北京', 800000.00),
('运营部', 'OPS', '孙磊', '杭州', 1200000.00),
('客户成功部', 'CS', '周婷', '成都', 900000.00);

-- 2. 职位数据
INSERT INTO job_positions (department_id, title, job_code, level, employment_type, min_salary, max_salary, headcount, status, required_skills, preferred_skills, description, posted_date) VALUES
-- 工程部职位
(1, '高级后端工程师 (Go/Python)', 'ENG-001', 'Senior', 'Full-time', 30000, 50000, 3, 'OPEN', 'Go, Python, MySQL, Redis, 微服务', 'Kubernetes, Kafka, gRPC', '负责核心业务系统的开发和优化', '2024-01-15'),
(1, '前端工程师 (React)', 'ENG-002', 'Mid', 'Full-time', 20000, 35000, 2, 'OPEN', 'React, TypeScript, CSS', 'Next.js, GraphQL, Tailwind', '开发和维护Web应用前端', '2024-02-01'),
(1, '全栈工程师', 'ENG-003', 'Senior', 'Full-time', 35000, 55000, 1, 'OPEN', 'React, Node.js, PostgreSQL', 'AWS, Docker, CI/CD', '独立完成全栈功能开发', '2024-01-20'),
(1, '移动开发工程师 (iOS)', 'ENG-004', 'Mid', 'Full-time', 25000, 40000, 1, 'OPEN', 'Swift, iOS SDK, UIKit', 'SwiftUI, RxSwift', '开发和维护iOS应用', '2024-02-10'),
(1, 'DevOps工程师', 'ENG-005', 'Senior', 'Full-time', 30000, 50000, 2, 'OPEN', 'Kubernetes, AWS, Terraform', 'Prometheus, ELK, GitOps', '负责基础设施和CI/CD', '2024-01-25'),
(1, '后端实习生', 'ENG-006', 'Junior', 'Intern', 5000, 8000, 2, 'OPEN', 'Python或Go基础, 数据库基础', '有开源项目经验', '协助开发后端功能', '2024-02-15'),

-- 数据科学部职位
(4, '机器学习工程师', 'DS-001', 'Senior', 'Full-time', 35000, 60000, 2, 'OPEN', 'Python, TensorFlow/PyTorch, ML算法', 'NLP, Computer Vision, MLOps', '开发和部署ML模型', '2024-01-18'),
(4, '数据分析师', 'DS-002', 'Mid', 'Full-time', 20000, 35000, 2, 'OPEN', 'SQL, Python, 数据可视化', 'Tableau, Statistics', '分析业务数据提供洞察', '2024-02-05'),
(4, '数据工程师', 'DS-003', 'Mid', 'Full-time', 25000, 40000, 1, 'OPEN', 'Spark, Airflow, SQL', 'Kafka, Flink, Data Warehouse', '构建数据管道和仓库', '2024-01-28'),

-- 产品部职位
(2, '高级产品经理', 'PROD-001', 'Senior', 'Full-time', 30000, 50000, 1, 'OPEN', '产品设计, 需求分析, 项目管理', 'B端产品经验, Agile', '负责核心产品的规划和设计', '2024-02-01'),
(2, '产品经理', 'PROD-002', 'Mid', 'Full-time', 20000, 35000, 2, 'OPEN', '用户研究, 产品设计, 数据分析', 'C端产品经验', '负责产品功能的设计和推进', '2024-02-08'),

-- 设计部职位
(3, 'UI/UX设计师', 'DESIGN-001', 'Mid', 'Full-time', 18000, 30000, 2, 'OPEN', 'Figma, Sketch, 用户体验设计', '动效设计, Design System', '负责产品界面和交互设计', '2024-02-03'),
(3, '资深设计师', 'DESIGN-002', 'Senior', 'Full-time', 25000, 40000, 1, 'OPEN', '设计思维, 品牌设计, 用户研究', '插画, 3D设计', '负责设计团队和重要项目', '2024-01-22'),

-- 市场部职位
(5, '内容运营', 'MKT-001', 'Mid', 'Full-time', 15000, 25000, 2, 'OPEN', '文案撰写, 内容策划, 社交媒体', 'SEO, 视频制作', '负责品牌内容的创作和运营', '2024-02-12'),
(5, '增长黑客', 'MKT-002', 'Senior', 'Full-time', 25000, 40000, 1, 'OPEN', '数据分析, A/B测试, 用户增长', 'SQL, Python, 增长策略', '负责用户增长和转化优化', '2024-02-06');

-- 3. 候选人数据 (50个候选人)
INSERT INTO candidates (first_name, last_name, email, phone, current_company, current_title, years_of_experience, education_level, university, major, source, location, expected_salary, notice_period_days, status) VALUES
-- 工程类候选人
('张', '明', 'zhang.ming@email.com', '13812345601', '阿里巴巴', '高级后端工程师', 6.5, 'Master', '清华大学', '计算机科学', 'LinkedIn', '北京', 45000, 30, 'ACTIVE'),
('李', '华', 'li.hua@email.com', '13812345602', '腾讯', '后端开发工程师', 4.2, 'Bachelor', '北京大学', '软件工程', 'Referral', '北京', 38000, 30, 'ACTIVE'),
('王', '磊', 'wang.lei@email.com', '13812345603', '字节跳动', '全栈工程师', 5.8, 'Master', '浙江大学', '计算机技术', 'Job Board', '杭州', 42000, 30, 'ACTIVE'),
('刘', '洋', 'liu.yang@email.com', '13812345604', '美团', '前端工程师', 3.5, 'Bachelor', '上海交通大学', '软件工程', 'LinkedIn', '上海', 28000, 30, 'ACTIVE'),
('陈', '思', 'chen.si@email.com', '13812345605', '百度', 'iOS工程师', 4.0, 'Bachelor', '华中科技大学', '计算机科学', 'Agency', '北京', 32000, 30, 'ACTIVE'),
('赵', '云', 'zhao.yun@email.com', '13812345606', '滴滴', 'DevOps工程师', 5.2, 'Bachelor', '西安电子科技大学', '通信工程', 'LinkedIn', '北京', 40000, 30, 'ACTIVE'),
('孙', '杰', 'sun.jie@email.com', '13812345607', '京东', '后端工程师', 3.0, 'Bachelor', '南京大学', '软件工程', 'Job Board', '南京', 25000, 30, 'ACTIVE'),
('周', '敏', 'zhou.min@email.com', '13812345608', '小米', '前端工程师', 2.5, 'Bachelor', '电子科技大学', '计算机科学', 'Referral', '北京', 22000, 30, 'ACTIVE'),
('吴', '涛', 'wu.tao@email.com', '13812345609', 'Shopee', '全栈工程师', 6.0, 'Master', '复旦大学', '软件工程', 'LinkedIn', '深圳', 48000, 30, 'ACTIVE'),
('郑', '伟', 'zheng.wei@email.com', '13812345610', 'B站', '后端工程师', 4.5, 'Bachelor', '中山大学', '计算机科学', 'Job Board', '上海', 35000, 30, 'ACTIVE'),
('马', '超', 'ma.chao@email.com', '13812345611', '网易', 'DevOps工程师', 5.5, 'Master', '同济大学', '软件工程', 'LinkedIn', '杭州', 42000, 30, 'ACTIVE'),
('黄', '鹏', 'huang.peng@email.com', '13812345612', '快手', 'iOS工程师', 3.8, 'Bachelor', '武汉大学', '计算机科学', 'Referral', '北京', 30000, 30, 'ACTIVE'),
('林', '峰', 'lin.feng@email.com', '13812345613', '拼多多', '后端工程师', 4.8, 'Bachelor', '哈尔滨工业大学', '软件工程', 'Job Board', '上海', 38000, 30, 'ACTIVE'),
('何', '静', 'he.jing@email.com', '13812345614', '携程', '前端工程师', 3.2, 'Bachelor', '四川大学', '计算机科学', 'LinkedIn', '上海', 26000, 30, 'ACTIVE'),
('徐', '强', 'xu.qiang@email.com', '13812345615', '顺丰科技', '全栈工程师', 5.0, 'Bachelor', '东南大学', '软件工程', 'Agency', '深圳', 40000, 30, 'ACTIVE'),

-- 数据科学类候选人
('高', '明', 'gao.ming@email.com', '13812345616', '微软', '机器学习工程师', 5.5, 'PhD', '清华大学', '人工智能', 'LinkedIn', '北京', 55000, 60, 'ACTIVE'),
('梁', '爽', 'liang.shuang@email.com', '13812345617', '商汤科技', '算法工程师', 4.0, 'Master', '北京大学', '模式识别', 'Referral', '北京', 45000, 30, 'ACTIVE'),
('冯', '娜', 'feng.na@email.com', '13812345618', '旷视科技', '机器学习工程师', 3.5, 'Master', '浙江大学', '机器学习', 'Job Board', '北京', 40000, 30, 'ACTIVE'),
('袁', '帅', 'yuan.shuai@email.com', '13812345619', '阿里云', '数据工程师', 4.5, 'Master', '上海交通大学', '大数据', 'LinkedIn', '杭州', 38000, 30, 'ACTIVE'),
('曹', '琳', 'cao.lin@email.com', '13812345620', '腾讯', '数据分析师', 3.0, 'Bachelor', '中国人民大学', '统计学', 'Job Board', '深圳', 28000, 30, 'ACTIVE'),
('杜', '洁', 'du.jie@email.com', '13812345621', '字节跳动', '数据分析师', 2.8, 'Master', '北京师范大学', '应用统计', 'LinkedIn', '北京', 30000, 30, 'ACTIVE'),
('唐', '宇', 'tang.yu@email.com', '13812345622', '百度AI', '算法研究员', 6.0, 'PhD', '中科院', '计算机视觉', 'Referral', '北京', 60000, 60, 'ACTIVE'),
('韩', '冰', 'han.bing@email.com', '13812345623', '华为', '数据工程师', 5.0, 'Master', '北京邮电大学', '数据科学', 'Agency', '深圳', 42000, 30, 'ACTIVE'),

-- 产品类候选人
('萧', '雨', 'xiao.yu@email.com', '13812345624', '滴滴', '高级产品经理', 6.0, 'Master', '清华大学', '工业工程', 'LinkedIn', '北京', 45000, 30, 'ACTIVE'),
('董', '梅', 'dong.mei@email.com', '13812345625', '美团', '产品经理', 4.0, 'Bachelor', '人民大学', '市场营销', 'Job Board', '北京', 35000, 30, 'ACTIVE'),
('彭', '飞', 'peng.fei@email.com', '13812345626', '京东', '产品经理', 3.5, 'Bachelor', '复旦大学', '信息管理', 'Referral', '北京', 32000, 30, 'ACTIVE'),
('谢', '婷', 'xie.ting@email.com', '13812345627', '网易', '产品经理', 4.5, 'Master', '浙江大学', '工商管理', 'LinkedIn', '杭州', 38000, 30, 'ACTIVE'),
('傅', '阳', 'fu.yang@email.com', '13812345628', '小米', '产品经理', 3.0, 'Bachelor', '武汉大学', '经济学', 'Job Board', '北京', 28000, 30, 'ACTIVE'),

-- 设计类候选人
('蒋', '莉', 'jiang.li@email.com', '13812345629', 'OPPO', 'UI设计师', 3.5, 'Bachelor', '中央美术学院', '视觉传达', 'LinkedIn', '深圳', 25000, 30, 'ACTIVE'),
('邹', '晨', 'zou.chen@email.com', '13812345630', 'vivo', 'UX设计师', 4.0, 'Bachelor', '中国美术学院', '交互设计', 'Referral', '深圳', 28000, 30, 'ACTIVE'),
('余', '芳', 'yu.fang@email.com', '13812345631', '字节跳动', '资深设计师', 5.5, 'Master', '清华美院', '设计学', 'LinkedIn', '北京', 38000, 30, 'ACTIVE'),
('田', '欢', 'tian.huan@email.com', '13812345632', '腾讯', 'UI设计师', 3.0, 'Bachelor', '江南大学', '数字媒体', 'Job Board', '深圳', 23000, 30, 'ACTIVE'),

-- 市场运营类候选人
('史', '军', 'shi.jun@email.com', '13812345633', '知乎', '内容运营', 3.0, 'Bachelor', '北京大学', '中文', 'LinkedIn', '北京', 22000, 30, 'ACTIVE'),
('秦', '丽', 'qin.li@email.com', '13812345634', 'B站', '内容运营', 2.5, 'Bachelor', '复旦大学', '新闻学', 'Job Board', '上海', 20000, 30, 'ACTIVE'),
('方', '涛', 'fang.tao@email.com', '13812345635', '小红书', '增长运营', 4.0, 'Master', '清华大学', '市场营销', 'Referral', '上海', 35000, 30, 'ACTIVE'),
('夏', '慧', 'xia.hui@email.com', '13812345636', '抖音', '用户运营', 3.5, 'Bachelor', '中国传媒大学', '广告学', 'LinkedIn', '北京', 28000, 30, 'ACTIVE'),

-- 实习生候选人
('钱', '程', 'qian.cheng@email.com', '13812345637', '在校学生', '实习生', 0.0, 'Bachelor', '清华大学', '计算机科学', 'Job Board', '北京', 6000, 0, 'ACTIVE'),
('沈', '洁', 'shen.jie@email.com', '13812345638', '在校学生', '实习生', 0.0, 'Bachelor', '北京大学', '软件工程', 'Referral', '北京', 7000, 0, 'ACTIVE'),
('姚', '鹏', 'yao.peng@email.com', '13812345639', '在校学生', '实习生', 0.5, 'Bachelor', '上海交通大学', '计算机科学', 'Job Board', '上海', 6500, 0, 'ACTIVE'),

-- 已拒绝/已录用的候选人
('卫', '强', 'wei.qiang@email.com', '13812345640', '微软', '高级工程师', 7.0, 'Master', '清华大学', '计算机科学', 'LinkedIn', '北京', 52000, 60, 'REJECTED'),
('蒋', '婷', 'jiang.ting@email.com', '13812345641', '谷歌', '软件工程师', 5.0, 'Master', 'Stanford', 'Computer Science', 'Referral', '北京', 60000, 60, 'REJECTED'),
('钟', '伟', 'zhong.wei@email.com', '13812345642', '亚马逊', '后端工程师', 4.5, 'Bachelor', '浙江大学', '软件工程', 'LinkedIn', '杭州', 40000, 30, 'HIRED'),
('苏', '敏', 'su.min@email.com', '13812345643', '滴滴', '产品经理', 4.0, 'Master', '清华大学', 'MBA', 'Referral', '北京', 42000, 30, 'HIRED'),
('许', '涛', 'xu.tao@email.com', '13812345644', '美团', 'DevOps', 5.5, 'Bachelor', '北京航空航天大学', '软件工程', 'Job Board', '北京', 45000, 30, 'HIRED'),

-- 主动撤回的候选人
('顾', '鹏', 'gu.peng@email.com', '13812345645', '字节跳动', '后端工程师', 4.0, 'Bachelor', '南京大学', '计算机科学', 'LinkedIn', '北京', 38000, 30, 'WITHDRAWN'),
('沈', '阳', 'shen.yang@email.com', '13812345646', '腾讯', '前端工程师', 3.5, 'Bachelor', '复旦大学', '软件工程', 'Job Board', '上海', 30000, 30, 'WITHDRAWN'),

-- 更多多样化候选人
('龚', '静', 'gong.jing@email.com', '13812345647', 'Shopee', '数据分析师', 3.2, 'Master', '南开大学', '统计学', 'LinkedIn', '深圳', 32000, 30, 'ACTIVE'),
('孔', '明', 'kong.ming@email.com', '13812345648', '快手', '算法工程师', 4.8, 'PhD', '中科院', '机器学习', 'Referral', '北京', 52000, 60, 'ACTIVE'),
('邵', '丽', 'shao.li@email.com', '13812345649', '爱奇艺', 'UI设计师', 3.8, 'Bachelor', '鲁迅美术学院', '视觉设计', 'Job Board', '北京', 26000, 30, 'ACTIVE'),
('万', '鹏', 'wan.peng@email.com', '13812345650', '拼多多', '增长经理', 5.0, 'Master', '上海交通大学', 'MBA', 'LinkedIn', '上海', 40000, 30, 'ACTIVE');

-- 4. 面试官数据
INSERT INTO interviewers (first_name, last_name, email, department_id, title, expertise, is_active) VALUES
-- 工程部面试官
('李', '建国', 'li.jianguo@company.com', 1, '技术总监', 'Go, 微服务架构, 系统设计', TRUE),
('王', '雪梅', 'wang.xuemei@company.com', 1, '高级工程师', 'Python, 数据库优化, 分布式系统', TRUE),
('张', '俊杰', 'zhang.junjie@company.com', 1, '架构师', 'React, 前端架构, 性能优化', TRUE),
('刘', '芳芳', 'liu.fangfang@company.com', 1, '高级工程师', 'iOS, Swift, 移动架构', TRUE),
('陈', '浩然', 'chen.haoran@company.com', 1, 'DevOps负责人', 'Kubernetes, AWS, CI/CD', TRUE),
('赵', '丽娟', 'zhao.lijuan@company.com', 1, '全栈工程师', 'Full-stack, Node.js, PostgreSQL', TRUE),
('孙', '伟强', 'sun.weiqiang@company.com', 1, '技术经理', 'Go, Python, 团队管理', TRUE),
('周', '晓燕', 'zhou.xiaoyan@company.com', 1, '高级前端工程师', 'React, TypeScript, 组件设计', TRUE),

-- 数据科学部面试官
('吴', '建华', 'wu.jianhua@company.com', 4, '数据科学总监', '机器学习, NLP, 深度学习', TRUE),
('郑', '小敏', 'zheng.xiaomin@company.com', 4, '高级算法工程师', 'Computer Vision, PyTorch, 模型部署', TRUE),
('黄', '志强', 'huang.zhiqiang@company.com', 4, '数据工程师', 'Spark, Airflow, 数据架构', TRUE),
('马', '丽丽', 'ma.lili@company.com', 4, '数据分析经理', 'SQL, Python, BI工具', TRUE),

-- 产品部面试官
('林', '建设', 'lin.jianshe@company.com', 2, '产品VP', '产品战略, B端产品, 团队管理', TRUE),
('何', '雅静', 'he.yajing@company.com', 2, '高级产品经理', '用户研究, 产品设计, 数据驱动', TRUE),
('徐', '明亮', 'xu.mingliang@company.com', 2, '产品总监', 'C端产品, 增长策略', TRUE),

-- 设计部面试官
('高', '秀英', 'gao.xiuying@company.com', 3, '设计总监', 'UX/UI, Design System, 品牌设计', TRUE),
('梁', '建军', 'liang.jianjun@company.com', 3, '资深设计师', '交互设计, 用户体验, 设计思维', TRUE),

-- 市场部面试官
('冯', '娟娟', 'feng.juanjuan@company.com', 5, '市场总监', '品牌营销, 内容策略, 用户增长', TRUE),
('袁', '国强', 'yuan.guoqiang@company.com', 5, '增长负责人', '数据分析, A/B测试, 增长黑客', TRUE),

-- HR面试官
('曹', '艳', 'cao.yan@company.com', 6, 'HR总监', '人才评估, 组织文化, 薪酬设计', TRUE),
('杜', '建平', 'du.jianping@company.com', 6, '招聘经理', '技术招聘, 面试技巧, 雇主品牌', TRUE);

-- 继续插入申请数据...
-- (由于数据量大，分成多个部分)
