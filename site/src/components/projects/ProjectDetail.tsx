import { motion } from 'framer-motion';
import { Star, Clock, Code, Github, FileText, Image as ImageIcon } from 'lucide-react';
import ScrollReveal from '../ui/ScrollReveal';
import AnimatedDiagram from '../diagrams/AnimatedDiagram';
import ExpandableSection from '../ui/ExpandableSection';
import type { ProjectData } from '../../data/projects';
import { getUrl, getImageUrl } from '../../utils/url';

interface ProjectDetailProps {
  project: ProjectData;
}

export default function ProjectDetail({ project }: ProjectDetailProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-block px-4 py-2 bg-accent/10 rounded-full text-accent font-semibold mb-4">
          实战项目 {project.number}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
          {project.title}
        </h1>
        <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
          {project.subtitle}
        </p>

        {/* Meta Info */}
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-text-secondary">难度:</span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < project.difficulty
                      ? 'fill-accent text-accent'
                      : 'text-gray-300'
                  }
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-text-secondary" />
            <span>{project.estimatedHours} 小时</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text-secondary">所属周次:</span>
            <a
              href={getUrl(`curriculum/week-${project.weekNumber}`)}
              className="text-accent hover:underline"
            >
              第 {project.weekNumber} 周
            </a>
          </div>
        </div>
      </motion.div>

      {/* Preview Image */}
      {project.previewImage && (
        <ScrollReveal>
          <div className="md-card p-10">
            <h2 className="text-h2 font-bold text-ink mb-8">项目预览</h2>
            <div style={{ backgroundColor: 'var(--md-fog)', padding: 'var(--space-8)', borderRadius: 0 }}>
              <img
                src={getImageUrl(project.previewImage)}
                alt={`${project.title} 预览`}
                className="w-full rounded-lg shadow-xl border-2 border-gray-200 bg-white"
              />
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Project Links */}
      {project.id === 'project-1' && (
        <ScrollReveal>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-primary mb-6">项目资源</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="https://github.com/tyrchen/geektime-bootcamp-ai/tree/master/w1/project-alpha"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-bg-secondary rounded-xl hover:shadow-md transition-all group"
              >
                <Github className="text-accent group-hover:scale-110 transition-transform" size={24} />
                <div>
                  <div className="font-semibold text-primary">GitHub 仓库</div>
                  <div className="text-sm text-text-secondary">查看完整源代码</div>
                </div>
              </a>
              <a
                href="https://github.com/tyrchen/geektime-bootcamp-ai/blob/master/specs/w1/0001-spec.md"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-bg-secondary rounded-xl hover:shadow-md transition-all group"
              >
                <FileText className="text-accent group-hover:scale-110 transition-transform" size={24} />
                <div>
                  <div className="font-semibold text-primary">项目规格说明</div>
                  <div className="text-sm text-text-secondary">详细需求和设计文档</div>
                </div>
              </a>
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Objectives */}
      <ScrollReveal>
        <div className="md-card p-10">
          <h2 className="text-h2 font-bold text-ink mb-10">项目目标</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {project.objectives.map((objective, index) => (
              <div key={index} className="flex gap-3 p-4 bg-bg-secondary rounded-xl">
                <span className="text-accent text-xl font-bold">
                  {index + 1}
                </span>
                <p className="text-text-primary flex-1">{objective}</p>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Tech Stack */}
      <ScrollReveal>
        <div className="md-card p-10">
          <h2 className="text-h2 font-bold text-ink mb-10">技术栈</h2>
          <div className="flex flex-wrap gap-4">
            {project.techStack.map((tech) => (
              <div
                key={tech}
                className="flex items-center gap-2 px-4 py-2 bg-bg-secondary rounded-full"
              >
                <Code size={16} className="text-accent" />
                <span className="font-medium">{tech}</span>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Architecture */}
      <ScrollReveal>
        <div className="md-card p-10">
          <h2 className="text-h2 font-bold text-ink mb-10">技术架构</h2>
          <AnimatedDiagram code={project.architecture} client:load />
        </div>
      </ScrollReveal>

      {/* Implementation Steps */}
      <ScrollReveal>
        <div className="md-card p-10">
          <h2 className="text-h2 font-bold text-ink mb-10">实现步骤</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {project.implementationSteps.map((step, index) => (
              <ExpandableSection
                key={index}
                title={`步骤 ${step.stepNumber}: ${step.title}`}
                defaultOpen={index === 0}
                client:load
              >
                <p className="text-text-secondary mb-4">{step.description}</p>
                {step.codeExample && (
                  <pre className="bg-bg-secondary p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{step.codeExample}</code>
                  </pre>
                )}
              </ExpandableSection>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Feature Screenshots */}
      {project.id === 'project-1' && (
        <ScrollReveal>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-primary mb-8 flex items-center gap-3">
              <ImageIcon className="text-accent" size={32} />
              功能截图
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="py-3">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <img
                    src={getImageUrl('projects/project-1/screenshot-create.png')}
                    alt="创建 Ticket"
                    className="w-full rounded-lg shadow-lg border border-gray-200 bg-white hover:shadow-xl transition-shadow"
                  />
                </div>
                <p className="text-center text-text-secondary font-medium">创建 Ticket 对话框</p>
              </div>
              <div className="py-3">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <img
                    src={getImageUrl('projects/project-1/screenshot-tags.png')}
                    alt="标签管理"
                    className="w-full rounded-lg shadow-lg border border-gray-200 bg-white hover:shadow-xl transition-shadow"
                  />
                </div>
                <p className="text-center text-text-secondary font-medium">标签管理界面</p>
              </div>
              <div className="py-3">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <img
                    src={getImageUrl('projects/project-1/screenshot-filter.png')}
                    alt="标签过滤"
                    className="w-full rounded-lg shadow-lg border border-gray-200 bg-white hover:shadow-xl transition-shadow"
                  />
                </div>
                <p className="text-center text-text-secondary font-medium">标签过滤功能</p>
              </div>
              <div className="py-3">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <img
                    src={getImageUrl('projects/project-1/screenshot-edit.png')}
                    alt="编辑 Ticket"
                    className="w-full rounded-lg shadow-lg border border-gray-200 bg-white hover:shadow-xl transition-shadow"
                  />
                </div>
                <p className="text-center text-text-secondary font-medium">编辑 Ticket 界面</p>
              </div>
            </div>
            <div className="mt-6">
              <div className="py-3">
                <div className="bg-gray-50 p-4 rounded-xl inline-block mx-auto">
                  <img
                    src={getImageUrl('projects/project-1/screenshot-mobile.png')}
                    alt="移动端响应式"
                    className="max-w-md mx-auto rounded-lg shadow-lg border border-gray-200 bg-white hover:shadow-xl transition-shadow"
                  />
                </div>
                <p className="text-center text-text-secondary font-medium">移动端响应式布局</p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Learning Points */}
      <ScrollReveal>
        <div className="md-card p-10">
          <h2 className="text-h2 font-bold text-ink mb-10">学习要点</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {project.learningPoints.map((point, index) => (
              <div key={index} className="flex gap-3 items-start">
                <span className="text-success text-2xl">✓</span>
                <p className="text-text-primary flex-1">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* CTA */}
      <ScrollReveal>
        <div
          className="md-card text-center"
          style={{
            background: 'linear-gradient(135deg, var(--md-sky) 0%, var(--md-sky-strong) 100%)',
            padding: 'var(--space-10)',
            border: '2px solid var(--md-graphite)'
          }}
        >
          <h2
            className="text-h2 font-bold text-graphite"
            style={{ marginBottom: 'var(--space-6)' }}
          >
            准备好开始这个项目了吗？
          </h2>
          <p
            className="text-body text-graphite"
            style={{
              marginBottom: 'var(--space-8)',
              opacity: 0.9,
              lineHeight: '1.6'
            }}
          >
            在第 {project.weekNumber} 周的课程中，跟随教程一步步完成这个项目
          </p>
          <div className="md-cta-stack justify-center">
            <a
              href={getUrl(`curriculum/week-${project.weekNumber}`)}
              className="md-btn"
            >
              前往第 {project.weekNumber} 周
            </a>
            <a
              href={getUrl('projects')}
              className="md-btn md-btn-secondary"
            >
              ← 返回所有项目
            </a>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
