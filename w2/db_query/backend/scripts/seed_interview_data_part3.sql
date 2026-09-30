-- Seed Data Part 3: Interview Schedules, Feedback, and Offers
USE interview_db;

-- 7. 面试安排数据
INSERT INTO interviews (application_id, interview_round_id, scheduled_date, scheduled_time, end_time, interview_type, location, meeting_link, status, notes) VALUES
-- 候选人1的面试 (application_id=1, 高级后端 - 第三轮)
(1, 1, '2024-02-02', '10:00:00', '10:30:00', 'PHONE', NULL, NULL, 'COMPLETED', '初筛通过'),
(1, 2, '2024-02-05', '14:00:00', '15:00:00', 'VIDEO', NULL, 'https://zoom.us/j/123456', 'COMPLETED', '技术能力不错'),
(1, 3, '2024-02-08', '15:00:00', '16:30:00', 'VIDEO', NULL, 'https://zoom.us/j/123457', 'COMPLETED', '系统设计能力强'),
(1, 4, '2024-02-12', '10:00:00', '11:00:00', 'ONSITE', '会议室A301', NULL, 'SCHEDULED', '技术终面'),

-- 候选人2的面试 (application_id=2, 高级后端 - 第二轮)
(2, 1, '2024-02-04', '11:00:00', '11:30:00', 'PHONE', NULL, NULL, 'COMPLETED', 'HR初筛通过'),
(2, 2, '2024-02-07', '10:00:00', '11:00:00', 'VIDEO', NULL, 'https://zoom.us/j/123458', 'COMPLETED', '算法基础扎实'),
(2, 3, '2024-02-13', '14:00:00', '15:30:00', 'VIDEO', NULL, 'https://zoom.us/j/123459', 'SCHEDULED', '技术二面'),

-- 候选人3的面试 (application_id=3, 高级后端 - Offer)
(3, 1, '2024-02-06', '14:00:00', '14:30:00', 'PHONE', NULL, NULL, 'COMPLETED', '初筛优秀'),
(3, 2, '2024-02-09', '10:00:00', '11:00:00', 'VIDEO', NULL, 'https://zoom.us/j/123460', 'COMPLETED', '全栈能力强'),
(3, 3, '2024-02-12', '16:00:00', '17:30:00', 'VIDEO', NULL, 'https://zoom.us/j/123461', 'COMPLETED', '技术和沟通都很好'),
(3, 4, '2024-02-14', '14:00:00', '15:00:00', 'ONSITE', '会议室A301', NULL, 'COMPLETED', '终面通过'),
(3, 5, '2024-02-15', '10:00:00', '10:45:00', 'VIDEO', NULL, 'https://zoom.us/j/123462', 'COMPLETED', 'HR面试通过'),

-- 候选人4的面试 (application_id=6, 前端 - 第二轮)
(6, 6, '2024-02-03', '10:00:00', '10:30:00', 'PHONE', NULL, NULL, 'COMPLETED', 'HR初筛通过'),
(6, 7, '2024-02-06', '15:00:00', '16:00:00', 'VIDEO', NULL, 'https://zoom.us/j/123463', 'COMPLETED', 'React经验丰富'),
(6, 9, '2024-02-14', '10:00:00', '11:00:00', 'VIDEO', NULL, 'https://zoom.us/j/123464', 'SCHEDULED', '技术二面'),

-- 候选人8的面试 (application_id=7, 前端 - Offer已接受)
(7, 6, '2024-02-05', '11:00:00', '11:30:00', 'PHONE', NULL, NULL, 'COMPLETED', 'HR初筛优秀'),
(7, 7, '2024-02-08', '14:00:00', '15:00:00', 'VIDEO', NULL, 'https://zoom.us/j/123465', 'COMPLETED', '技术能力突出'),
(7, 8, '2024-02-09', '09:00:00', '11:00:00', 'CODING_TEST', NULL, 'https://coding-test.com/123', 'COMPLETED', '编码测试优秀'),
(7, 9, '2024-02-12', '10:00:00', '11:00:00', 'VIDEO', NULL, 'https://zoom.us/j/123466', 'COMPLETED', '架构能力好'),
(7, 10, '2024-02-13', '15:00:00', '15:45:00', 'VIDEO', NULL, 'https://zoom.us/j/123467', 'COMPLETED', 'HR面试通过'),

-- 候选人9的面试 (application_id=11, 全栈 - 终面)
(11, 11, '2024-01-26', '14:00:00', '14:30:00', 'PHONE', NULL, NULL, 'COMPLETED', 'Shopee背景优秀'),
(11, 12, '2024-01-30', '10:00:00', '11:30:00', 'VIDEO', NULL, 'https://zoom.us/j/123468', 'COMPLETED', '全栈能力强'),
(11, 13, '2024-02-02', '14:00:00', '15:30:00', 'VIDEO', NULL, 'https://zoom.us/j/123469', 'COMPLETED', '系统设计优秀'),
(11, 14, '2024-02-13', '14:00:00', '15:00:00', 'ONSITE', '会议室B201', NULL, 'SCHEDULED', '技术终面'),

-- 候选人5的面试 (application_id=14, iOS - 第一轮)
(14, 16, '2024-02-07', '10:00:00', '10:30:00', 'PHONE', NULL, NULL, 'COMPLETED', 'HR初筛通过'),
(14, 17, '2024-02-14', '15:00:00', '16:00:00', 'VIDEO', NULL, 'https://zoom.us/j/123470', 'SCHEDULED', '技术一面'),

-- 候选人6的面试 (application_id=15, DevOps - Offer)
(15, 21, '2024-01-29', '11:00:00', '11:30:00', 'PHONE', NULL, NULL, 'COMPLETED', 'HR初筛优秀'),
(15, 21, '2024-02-01', '10:00:00', '11:00:00', 'VIDEO', NULL, 'https://zoom.us/j/123471', 'COMPLETED', 'K8s经验丰富'),
(15, 23, '2024-02-05', '14:00:00', '15:30:00', 'VIDEO', NULL, 'https://zoom.us/j/123472', 'COMPLETED', 'DevOps实践经验好'),
(15, 24, '2024-02-08', '10:00:00', '11:00:00', 'ONSITE', '会议室A301', NULL, 'COMPLETED', '技术终面通过'),
(15, 25, '2024-02-09', '14:00:00', '14:45:00', 'VIDEO', NULL, 'https://zoom.us/j/123473', 'COMPLETED', 'HR面试通过'),

-- 候选人16的面试 (application_id=23, ML - Offer)
(23, 31, '2024-01-21', '10:00:00', '10:30:00', 'PHONE', NULL, NULL, 'COMPLETED', 'PhD背景优秀'),
(23, 32, '2024-01-25', '14:00:00', '15:30:00', 'VIDEO', NULL, 'https://zoom.us/j/123474', 'COMPLETED', '算法能力强'),
(23, 33, '2024-01-29', '10:00:00', '11:30:00', 'VIDEO', NULL, 'https://zoom.us/j/123475', 'COMPLETED', '项目经验丰富'),
(23, 34, '2024-02-01', '09:00:00', '11:00:00', 'CODING_TEST', NULL, 'https://coding-test.com/456', 'COMPLETED', '算法实践优秀'),
(23, 35, '2024-02-05', '14:00:00', '15:00:00', 'ONSITE', '会议室C301', NULL, 'COMPLETED', '技术终面优秀'),
(23, 36, '2024-02-06', '10:00:00', '10:45:00', 'VIDEO', NULL, 'https://zoom.us/j/123476', 'COMPLETED', 'HR面试通过'),

-- 候选人17的面试 (application_id=24, ML - 第三轮)
(24, 31, '2024-01-26', '14:00:00', '14:30:00', 'PHONE', NULL, NULL, 'COMPLETED', '商汤背景好'),
(24, 32, '2024-01-30', '10:00:00', '11:30:00', 'VIDEO', NULL, 'https://zoom.us/j/123477', 'COMPLETED', 'ML算法扎实'),
(24, 33, '2024-02-12', '14:00:00', '15:30:00', 'VIDEO', NULL, 'https://zoom.us/j/123478', 'SCHEDULED', '技术二面'),

-- 候选人20的面试 (application_id=28, 数据分析 - 第一轮)
(28, 37, '2024-02-03', '15:00:00', '15:30:00', 'PHONE', NULL, NULL, 'COMPLETED', 'HR初筛通过'),
(28, 38, '2024-02-14', '10:00:00', '11:00:00', 'VIDEO', NULL, 'https://zoom.us/j/123479', 'SCHEDULED', '技术一面'),

-- 候选人24的面试 (application_id=32, 高级PM - 终面)
(32, 46, '2024-02-02', '10:00:00', '10:30:00', 'PHONE', NULL, NULL, 'COMPLETED', 'HR初筛优秀'),
(32, 47, '2024-02-06', '14:00:00', '15:30:00', 'VIDEO', NULL, 'https://zoom.us/j/123480', 'COMPLETED', '产品思维好'),
(32, 48, '2024-02-09', '10:00:00', '11:30:00', 'VIDEO', NULL, 'https://zoom.us/j/123481', 'COMPLETED', '用户洞察强'),
(32, 49, '2024-02-14', '15:00:00', '16:00:00', 'ONSITE', '会议室B201', NULL, 'SCHEDULED', '产品VP终面'),

-- 候选人37的面试 (application_id=38, 实习生 - 第一轮)
(38, 26, '2024-02-13', '14:00:00', '14:20:00', 'PHONE', NULL, NULL, 'COMPLETED', '清华在读，基础好'),
(38, 27, '2024-02-15', '10:00:00', '10:45:00', 'VIDEO', NULL, 'https://zoom.us/j/123482', 'SCHEDULED', '技术面试'),

-- 取消的面试
(10, 2, '2024-02-09', '10:00:00', '11:00:00', 'VIDEO', NULL, 'https://zoom.us/j/123483', 'CANCELLED', '候选人临时有事'),

-- No Show的面试
(13, 1, '2024-02-11', '14:00:00', '14:30:00', 'PHONE', NULL, NULL, 'NO_SHOW', '候选人未接听');

-- 8. 面试官分配
INSERT INTO interview_assignments (interview_id, interviewer_id, role, confirmed, feedback_submitted) VALUES
-- 候选人1的面试官分配
(1, 20, 'PRIMARY', TRUE, TRUE),  -- HR总监
(2, 1, 'PRIMARY', TRUE, TRUE),   -- 技术总监
(2, 2, 'SECONDARY', TRUE, TRUE), -- 高级工程师
(3, 2, 'PRIMARY', TRUE, TRUE),   -- 高级工程师
(3, 7, 'SECONDARY', TRUE, TRUE), -- 技术经理
(4, 1, 'PRIMARY', TRUE, FALSE),  -- 技术总监终面

-- 候选人2的面试官分配
(5, 21, 'PRIMARY', TRUE, TRUE),  -- 招聘经理
(6, 2, 'PRIMARY', TRUE, TRUE),   -- 高级工程师
(6, 7, 'SECONDARY', TRUE, TRUE), -- 技术经理
(7, 1, 'PRIMARY', TRUE, FALSE),  -- 技术总监

-- 候选人3的面试官分配 (已完成全部面试)
(8, 21, 'PRIMARY', TRUE, TRUE),  -- HR
(9, 6, 'PRIMARY', TRUE, TRUE),   -- 全栈工程师
(10, 1, 'PRIMARY', TRUE, TRUE),  -- 技术总监
(10, 2, 'SECONDARY', TRUE, TRUE), -- 高级工程师
(11, 1, 'PRIMARY', TRUE, TRUE),  -- 技术总监
(12, 20, 'PRIMARY', TRUE, TRUE), -- HR总监

-- 候选人4的前端面试
(13, 21, 'PRIMARY', TRUE, TRUE), -- 招聘经理
(14, 3, 'PRIMARY', TRUE, TRUE),  -- 前端架构师
(14, 8, 'SECONDARY', TRUE, TRUE), -- 高级前端工程师
(15, 3, 'PRIMARY', TRUE, FALSE), -- 前端架构师

-- 候选人8的前端面试 (已接受offer)
(16, 21, 'PRIMARY', TRUE, TRUE), -- HR招聘经理
(17, 3, 'PRIMARY', TRUE, TRUE),  -- 前端架构师
(18, 3, 'PRIMARY', TRUE, TRUE),  -- 前端架构师 (编码测试评审)
(19, 8, 'PRIMARY', TRUE, TRUE),  -- 高级前端工程师
(19, 3, 'SECONDARY', TRUE, TRUE), -- 前端架构师
(20, 20, 'PRIMARY', TRUE, TRUE), -- HR总监

-- 候选人9的全栈面试
(21, 21, 'PRIMARY', TRUE, TRUE), -- 招聘经理
(22, 6, 'PRIMARY', TRUE, TRUE),  -- 全栈工程师
(23, 1, 'PRIMARY', TRUE, TRUE),  -- 技术总监
(23, 6, 'SECONDARY', TRUE, TRUE), -- 全栈工程师
(24, 1, 'PRIMARY', TRUE, FALSE), -- 技术总监终面

-- 候选人5的iOS面试
(25, 21, 'PRIMARY', TRUE, TRUE), -- HR招聘经理
(26, 4, 'PRIMARY', TRUE, FALSE), -- iOS工程师

-- 候选人6的DevOps面试 (已发offer)
(27, 21, 'PRIMARY', TRUE, TRUE), -- 招聘经理
(28, 5, 'PRIMARY', TRUE, TRUE),  -- DevOps负责人
(29, 5, 'PRIMARY', TRUE, TRUE),  -- DevOps负责人
(29, 1, 'SECONDARY', TRUE, TRUE), -- 技术总监
(30, 1, 'PRIMARY', TRUE, TRUE),  -- 技术总监
(31, 20, 'PRIMARY', TRUE, TRUE), -- HR总监

-- 候选人16的ML面试 (已发offer)
(32, 21, 'PRIMARY', TRUE, TRUE), -- HR招聘经理
(33, 9, 'PRIMARY', TRUE, TRUE),  -- 数据科学总监
(33, 10, 'SECONDARY', TRUE, TRUE), -- 高级算法工程师
(34, 10, 'PRIMARY', TRUE, TRUE), -- 高级算法工程师
(35, 9, 'PRIMARY', TRUE, TRUE),  -- 数据科学总监 (编码测试评审)
(36, 9, 'PRIMARY', TRUE, TRUE),  -- 数据科学总监终面
(37, 20, 'PRIMARY', TRUE, TRUE), -- HR总监

-- 候选人24的高级PM面试
(41, 21, 'PRIMARY', TRUE, TRUE), -- HR招聘经理
(42, 13, 'PRIMARY', TRUE, TRUE), -- 产品VP
(43, 14, 'PRIMARY', TRUE, TRUE), -- 高级PM
(43, 15, 'SECONDARY', TRUE, TRUE), -- 产品总监
(44, 13, 'PRIMARY', TRUE, FALSE); -- 产品VP终面

-- 9. 面试反馈
INSERT INTO interview_feedback (interview_id, interviewer_id, overall_rating, technical_skills_rating, communication_rating, problem_solving_rating, cultural_fit_rating, recommendation, strengths, weaknesses, detailed_feedback) VALUES
-- 候选人1的反馈
(1, 21, 4, NULL, 4, NULL, 4, 'HIRE', '沟通清晰，有大厂背景', '期望薪资较高', 'HR初筛通过，候选人背景符合，可以进入技术面试'),
(2, 1, 4, 5, 4, 5, 4, 'HIRE', '技术能力强，系统设计思路清晰，有Go和Python实战经验', '对某些分布式系统细节了解不够深入', '候选人在阿里有6.5年经验，技术栈匹配度高。算法基础扎实，能够清晰表达系统设计思路。建议继续推进'),
(2, 2, 4, 4, 4, 4, 4, 'HIRE', '数据库优化经验丰富，项目经验好', '缺少大规模系统经验', '候选人技术能力不错，可以胜任高级后端岗位'),
(3, 2, 5, 5, 5, 5, 5, 'STRONG_HIRE', 'Go微服务经验丰富，系统设计能力强，沟通excellent', '暂无明显弱点', '强烈推荐！候选人技术功底扎实，有实际微服务架构经验，能够独立设计和实现复杂系统。沟通能力好，团队协作意识强'),
(3, 7, 5, 5, 4, 5, 5, 'STRONG_HIRE', '架构思维清晰，对性能优化有深入理解', '无', '优秀候选人，建议快速推进'),

-- 候选人2的反馈
(5, 21, 3, NULL, 3, NULL, 4, 'HIRE', '背景不错，态度积极', '表达能力一般', 'HR初筛合格，可以进入技术面试'),
(6, 2, 3, 3, 3, 4, 3, 'HIRE', '算法基础扎实，学习能力好', '项目经验相对较少，系统设计能力需提升', '候选人基础不错，但是经验相对欠缺，建议再观察'),
(6, 7, 4, 4, 3, 4, 4, 'HIRE', '解决问题能力不错，有潜力', '沟通能力需要提升', '总体合格，建议继续面试'),

-- 候选人3的反馈 (已发offer)
(8, 21, 5, NULL, 5, NULL, 5, 'STRONG_HIRE', '综合素质优秀', '无', '强烈推荐的候选人'),
(9, 6, 5, 5, 5, 5, 5, 'STRONG_HIRE', '全栈能力突出，React和Node.js都很精通，PostgreSQL经验丰富', '无明显弱点', '非常优秀的全栈候选人！在Shopee有实际全栈项目经验，能够独立完成前后端开发。建议发offer'),
(10, 1, 5, 5, 5, 5, 4, 'STRONG_HIRE', '技术深度和广度都很好，系统设计能力强', '对团队管理经验相对较少', '优秀的技术人才，强烈推荐录用'),
(10, 2, 5, 5, 4, 5, 5, 'STRONG_HIRE', '代码质量高，工程能力强', '无', '强烈推荐'),
(11, 1, 5, 5, 5, 5, 5, 'STRONG_HIRE', '技术全面，沟通清晰，文化契合度高', '无', '非常优秀的候选人，建议立即发offer'),
(12, 20, 5, NULL, 5, NULL, 5, 'STRONG_HIRE', '团队协作能力强，价值观匹配', '无', '强烈推荐录用'),

-- 候选人4的前端反馈
(13, 21, 4, NULL, 4, NULL, 4, 'HIRE', '上交背景，React经验丰富', '无', 'HR初筛通过'),
(14, 3, 4, 4, 4, 4, 4, 'HIRE', 'React和JavaScript基础扎实，有实际项目经验', '对性能优化了解不够深入', '候选人技术能力符合要求，建议继续推进'),
(14, 8, 4, 4, 4, 4, 3, 'HIRE', '组件设计能力不错', '对前端工程化了解一般', '整体合格'),

-- 候选人8的前端反馈 (已接受offer)
(16, 21, 5, NULL, 5, NULL, 5, 'STRONG_HIRE', '小米背景，态度积极', '无', 'HR初筛优秀'),
(17, 3, 5, 5, 4, 5, 5, 'STRONG_HIRE', 'React技术栈精通，有Next.js实战经验', '无明显弱点', '非常优秀的前端候选人，强烈推荐'),
(18, 3, 5, 5, NULL, 5, NULL, 'STRONG_HIRE', '编码质量高，算法能力强', '无', '编码测试优秀，代码规范性好'),
(19, 8, 5, 5, 5, 5, 5, 'STRONG_HIRE', '前端架构能力强，性能优化经验丰富', '无', '强烈推荐录用'),
(19, 3, 5, 5, 5, 5, 4, 'STRONG_HIRE', '技术全面，学习能力强', '无', '优秀候选人'),
(20, 20, 5, NULL, 5, NULL, 5, 'STRONG_HIRE', '文化契合度高，稳定性好', '无', '强烈推荐'),

-- 候选人9的全栈反馈
(21, 21, 4, NULL, 4, NULL, 5, 'HIRE', 'Shopee背景优秀', '无', 'HR初筛通过'),
(22, 6, 5, 5, 5, 5, 5, 'STRONG_HIRE', '全栈能力非常强，技术广度和深度都很好', '无', '非常优秀的全栈候选人，强烈推荐'),
(23, 1, 5, 5, 5, 5, 4, 'STRONG_HIRE', '系统设计能力优秀，有大规模系统经验', '对某些新技术了解不够', '优秀候选人，建议录用'),
(23, 6, 5, 5, 4, 5, 5, 'STRONG_HIRE', '工程能力强，代码质量高', '无', '强烈推荐'),

-- 候选人6的DevOps反馈 (已发offer)
(27, 21, 5, NULL, 5, NULL, 5, 'STRONG_HIRE', '滴滴DevOps背景', '无', 'HR初筛优秀'),
(28, 5, 5, 5, 5, 5, 5, 'STRONG_HIRE', 'K8s专家，有大规模集群管理经验，CI/CD实践丰富', '无明显弱点', '非常优秀的DevOps候选人，技术能力强，经验丰富，强烈推荐'),
(29, 5, 5, 5, 5, 5, 5, 'STRONG_HIRE', '基础设施设计能力强，对监控告警有深入理解', '无', '强烈推荐录用'),
(29, 1, 5, 5, 4, 5, 4, 'STRONG_HIRE', 'DevOps最佳实践经验丰富', '无', '优秀候选人'),
(30, 1, 5, 5, 5, 5, 5, 'STRONG_HIRE', '技术全面，团队协作能力强', '无', '强烈推荐'),
(31, 20, 5, NULL, 5, NULL, 5, 'STRONG_HIRE', '文化契合度高', '无', '强烈推荐录用'),

-- 候选人16的ML反馈 (已发offer)
(32, 21, 5, NULL, 5, NULL, 5, 'STRONG_HIRE', '微软AI背景，PhD学位', '无', 'HR初筛优秀'),
(33, 9, 5, 5, 5, 5, 5, 'STRONG_HIRE', 'ML算法功底深厚，数学基础扎实，有实际项目经验', '无', '顶尖的ML候选人，强烈推荐'),
(33, 10, 5, 5, 4, 5, 5, 'STRONG_HIRE', '深度学习经验丰富，模型优化能力强', '无', '强烈推荐'),
(34, 10, 5, 5, NULL, 5, NULL, 'STRONG_HIRE', 'CV方向专家，论文发表质量高', '无', '算法实践优秀'),
(35, 9, 5, 5, 5, 5, 5, 'STRONG_HIRE', '技术前沿理解深入，创新能力强', '无', '强烈推荐录用，可以带领团队'),
(36, 9, 5, 5, 5, 5, 5, 'STRONG_HIRE', '技术和文化都非常匹配', '无', '强烈推荐'),
(37, 20, 5, NULL, 5, NULL, 5, 'STRONG_HIRE', '综合素质优秀', '无', '强烈推荐录用'),

-- 候选人24的高级PM反馈
(41, 21, 5, NULL, 5, NULL, 5, 'STRONG_HIRE', '滴滴PM，6年经验', '无', 'HR初筛优秀'),
(42, 13, 5, NULL, 5, 5, 5, 'STRONG_HIRE', '产品思维好，有B端产品经验，项目管理能力强', '无', '优秀的PM候选人，强烈推荐'),
(43, 14, 5, NULL, 5, 5, 5, 'STRONG_HIRE', '用户洞察深入，数据驱动意识强', '无', '强烈推荐'),
(43, 15, 5, NULL, 5, 5, 4, 'STRONG_HIRE', '产品设计能力强', '对C端产品经验相对较少', '优秀候选人'),

-- 候选人37的实习生反馈
(45, 21, 4, NULL, 4, NULL, 4, 'HIRE', '清华在读，算法基础好', '实际项目经验少', 'HR初筛通过');

-- 10. Offer数据
INSERT INTO offers (application_id, offer_date, expiry_date, base_salary, bonus, equity_shares, sign_on_bonus, relocation_package, benefits_package, start_date, status, response_date, rejection_reason, notes) VALUES
-- 候选人3 - 高级后端 (Offer已发出)
(3, '2024-02-16', '2024-02-23', 48000, 96000, 5000, 50000, NULL, NULL, '2024-03-15', 'PENDING', NULL, NULL, '优秀的全栈候选人，给予有竞争力的offer'),

-- 候选人8 - 前端 (Offer已接受)
(7, '2024-02-14', '2024-02-21', 28000, 42000, 3000, 20000, NULL, NULL, '2024-03-01', 'ACCEPTED', '2024-02-16', NULL, 'Offer已接受，准备入职'),

-- 候选人6 - DevOps (Offer已发出)
(15, '2024-02-10', '2024-02-17', 45000, 90000, 5000, 40000, NULL, NULL, '2024-03-01', 'PENDING', NULL, NULL, 'DevOps专家，给予高薪offer'),

-- 候选人44 - DevOps (Offer已接受)
(17, '2024-02-09', '2024-02-16', 44000, 88000, 5000, 35000, NULL, NULL, '2024-02-23', 'ACCEPTED', '2024-02-11', NULL, '已接受，2周后入职'),

-- 候选人16 - ML工程师 (Offer已发出)
(23, '2024-02-07', '2024-02-14', 58000, 116000, 10000, 80000, NULL, NULL, '2024-03-01', 'PENDING', NULL, NULL, '顶尖ML人才，给予最高级别offer'),

-- 候选人42 - 高级后端 (Offer已接受 - 已入职)
(46, '2024-01-20', '2024-01-27', 42000, 84000, 4000, 30000, NULL, NULL, '2024-02-05', 'ACCEPTED', '2024-01-22', NULL, '已接受并入职'),

-- 候选人43 - 高级PM (Offer已接受)
(33, '2024-02-06', '2024-02-13', 45000, 90000, 5000, 40000, NULL, NULL, '2024-03-01', 'ACCEPTED', '2024-02-08', NULL, '已接受，准备入职'),

-- 已拒绝的offer
(13, '2024-01-25', '2024-02-01', 38000, 76000, 4000, 30000, NULL, NULL, '2024-02-15', 'REJECTED', '2024-01-28', '薪资不满意', '候选人拒绝，接受了其他公司offer'),

-- 已过期的offer
(12, '2024-01-15', '2024-01-22', 40000, 80000, 4000, 30000, NULL, NULL, '2024-02-01', 'EXPIRED', NULL, NULL, 'Offer过期，候选人未回复');

-- 11. 背景调查数据
INSERT INTO background_checks (application_id, check_type, vendor, initiated_date, completed_date, status, result, details) VALUES
-- 候选人3的背景调查
(3, 'EDUCATION', '学信网', '2024-02-16', '2024-02-17', 'COMPLETED', 'CLEAR', '浙江大学硕士学位verified'),
(3, 'EMPLOYMENT', '第一背调', '2024-02-16', '2024-02-18', 'COMPLETED', 'CLEAR', 'Shopee工作经历属实，无不良记录'),
(3, 'CRIMINAL', '公安系统', '2024-02-16', '2024-02-19', 'COMPLETED', 'CLEAR', '无犯罪记录'),

-- 候选人8的背景调查
(7, 'EDUCATION', '学信网', '2024-02-14', '2024-02-15', 'COMPLETED', 'CLEAR', '电子科技大学本科学位verified'),
(7, 'EMPLOYMENT', '第一背调', '2024-02-14', '2024-02-16', 'COMPLETED', 'CLEAR', '小米工作经历属实'),

-- 候选人6的背景调查
(15, 'EDUCATION', '学信网', '2024-02-10', '2024-02-11', 'COMPLETED', 'CLEAR', '西安电子科技大学本科学位verified'),
(15, 'EMPLOYMENT', '第一背调', '2024-02-10', '2024-02-12', 'COMPLETED', 'CLEAR', '滴滴工作经历属实，表现优秀'),
(15, 'CRIMINAL', '公安系统', '2024-02-10', '2024-02-13', 'COMPLETED', 'CLEAR', '无犯罪记录'),

-- 候选人16的背景调查
(23, 'EDUCATION', '教育部留服中心', '2024-02-07', '2024-02-08', 'COMPLETED', 'CLEAR', '清华大学PhD学位verified'),
(23, 'EMPLOYMENT', '第一背调', '2024-02-07', '2024-02-09', 'COMPLETED', 'CLEAR', '微软工作经历属实，发表多篇顶会论文'),
(23, 'CRIMINAL', '公安系统', '2024-02-07', '2024-02-10', 'COMPLETED', 'CLEAR', '无犯罪记录'),

-- 进行中的背景调查
(17, 'EDUCATION', '学信网', '2024-02-09', NULL, 'IN_PROGRESS', NULL, NULL),
(17, 'EMPLOYMENT', '第一背调', '2024-02-09', NULL, 'IN_PROGRESS', NULL, NULL),

-- 有问题的背景调查
(13, 'EMPLOYMENT', '第一背调', '2024-01-25', '2024-01-27', 'COMPLETED', 'CONCERN', '前公司HR反馈候选人曾有一次迟到警告');

-- 12. 活动日志
INSERT INTO activity_logs (application_id, interview_id, activity_type, actor_name, actor_email, description, created_at) VALUES
-- 候选人1的活动
(1, NULL, 'APPLICATION_CREATED', '系统', 'system@company.com', '候选人张明申请高级后端工程师职位', '2024-02-01 10:00:00'),
(1, NULL, 'STATUS_CHANGED', '杜建平', 'du.jianping@company.com', '状态变更: PENDING -> SCREENING', '2024-02-01 14:00:00'),
(1, 1, 'INTERVIEW_SCHEDULED', '杜建平', 'du.jianping@company.com', '安排电话初筛面试', '2024-02-01 15:00:00'),
(1, 1, 'INTERVIEW_COMPLETED', '曹艳', 'cao.yan@company.com', '完成电话初筛', '2024-02-02 10:30:00'),
(1, NULL, 'STATUS_CHANGED', '杜建平', 'du.jianping@company.com', '状态变更: SCREENING -> INTERVIEW', '2024-02-02 11:00:00'),
(1, 2, 'INTERVIEW_SCHEDULED', '杜建平', 'du.jianping@company.com', '安排技术一面', '2024-02-02 14:00:00'),
(1, 2, 'INTERVIEW_COMPLETED', '李建国', 'li.jianguo@company.com', '完成技术一面', '2024-02-05 15:00:00'),
(1, 2, 'FEEDBACK_SUBMITTED', '李建国', 'li.jianguo@company.com', '提交面试反馈：HIRE', '2024-02-05 16:00:00'),
(1, 3, 'INTERVIEW_SCHEDULED', '杜建平', 'du.jianping@company.com', '安排技术二面', '2024-02-05 17:00:00'),

-- 候选人3的活动 (完整流程)
(3, NULL, 'APPLICATION_CREATED', '系统', 'system@company.com', '候选人王磊申请高级后端工程师职位', '2024-02-05 09:00:00'),
(3, NULL, 'STATUS_CHANGED', '杜建平', 'du.jianping@company.com', '状态变更: PENDING -> SCREENING', '2024-02-05 10:00:00'),
(3, 8, 'INTERVIEW_SCHEDULED', '杜建平', 'du.jianping@company.com', '安排电话初筛', '2024-02-05 11:00:00'),
(3, 8, 'INTERVIEW_COMPLETED', '曹艳', 'cao.yan@company.com', '完成电话初筛', '2024-02-06 14:30:00'),
(3, NULL, 'STATUS_CHANGED', '杜建平', 'du.jianping@company.com', '状态变更: SCREENING -> INTERVIEW', '2024-02-06 15:00:00'),
(3, 9, 'INTERVIEW_SCHEDULED', '杜建平', 'du.jianping@company.com', '安排技术一面', '2024-02-06 15:30:00'),
(3, 9, 'INTERVIEW_COMPLETED', '刘芳芳', 'liu.fangfang@company.com', '完成技术一面', '2024-02-09 11:00:00'),
(3, 10, 'INTERVIEW_SCHEDULED', '杜建平', 'du.jianping@company.com', '安排技术二面', '2024-02-09 14:00:00'),
(3, 10, 'INTERVIEW_COMPLETED', '李建国', 'li.jianguo@company.com', '完成技术二面', '2024-02-12 17:30:00'),
(3, 11, 'INTERVIEW_SCHEDULED', '杜建平', 'du.jianping@company.com', '安排技术终面', '2024-02-12 18:00:00'),
(3, 11, 'INTERVIEW_COMPLETED', '李建国', 'li.jianguo@company.com', '完成技术终面', '2024-02-14 15:00:00'),
(3, 12, 'INTERVIEW_SCHEDULED', '杜建平', 'du.jianping@company.com', '安排HR面试', '2024-02-14 15:30:00'),
(3, 12, 'INTERVIEW_COMPLETED', '曹艳', 'cao.yan@company.com', '完成HR面试', '2024-02-15 10:45:00'),
(3, NULL, 'STATUS_CHANGED', '杜建平', 'du.jianping@company.com', '状态变更: INTERVIEW -> OFFER', '2024-02-15 11:00:00'),
(3, NULL, 'OFFER_CREATED', '曹艳', 'cao.yan@company.com', '创建Offer: 月薪48000', '2024-02-16 10:00:00'),
(3, NULL, 'BACKGROUND_CHECK_INITIATED', '杜建平', 'du.jianping@company.com', '发起背景调查', '2024-02-16 10:30:00'),

-- Offer相关活动
(7, NULL, 'OFFER_ACCEPTED', '周敏', 'zhou.min@email.com', '候选人接受Offer', '2024-02-15 14:00:00'),
(7, NULL, 'STATUS_CHANGED', '杜建平', 'du.jianping@company.com', '状态变更: OFFER -> ACCEPTED', '2024-02-15 14:30:00'),

-- 拒绝的活动
(45, NULL, 'APPLICATION_WITHDRAWN', '顾鹏', 'gu.peng@email.com', '候选人撤回申请', '2024-02-04 10:00:00'),
(45, NULL, 'STATUS_CHANGED', '杜建平', 'du.jianping@company.com', '状态变更: INTERVIEW -> DECLINED', '2024-02-04 10:30:00'),

-- 面试取消活动
(10, NULL, 'INTERVIEW_CANCELLED', '杜建平', 'du.jianping@company.com', '候选人临时有事，取消面试', '2024-02-08 16:00:00'),
(10, NULL, 'INTERVIEW_RESCHEDULED', '杜建平', 'du.jianping@company.com', '重新安排面试时间', '2024-02-08 16:30:00');
