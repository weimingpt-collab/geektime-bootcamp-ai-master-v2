import { motion } from 'framer-motion';
import ScrollReveal from '../ui/ScrollReveal';
import AnimatedDiagram from '../diagrams/AnimatedDiagram';
import ExpandableSection from '../ui/ExpandableSection';
import type { ToolData } from '../../data/tools';
import { getUrl } from '../../utils/url';

interface ToolDetailProps {
  tool: ToolData;
}

export default function ToolDetail({ tool }: ToolDetailProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-accent to-accent-purple rounded-3xl flex items-center justify-center shadow-xl">
          <span className="text-6xl font-bold text-white">{tool.name[0]}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
          {tool.name}
        </h1>
        <p className="text-2xl text-accent mb-6">{tool.tagline}</p>
        <p className="text-xl text-text-secondary max-w-3xl mx-auto">
          {tool.description}
        </p>
        <div className="mt-8">
          <a
            href={tool.officialWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="md-btn"
          >
            访问官网 →
          </a>
        </div>
      </motion.div>

      {/* Features */}
      <ScrollReveal>
        <div className="md-card p-10">
          <h2 className="text-h2 font-bold text-ink mb-10">核心功能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tool.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 p-6 bg-bg-secondary rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="text-4xl">{feature.icon}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Architecture */}
      {tool.architecture && (
        <ScrollReveal>
          <div className="md-card p-10">
            <h2 className="text-h2 font-bold text-ink mb-10">技术架构</h2>
            <AnimatedDiagram code={tool.architecture} client:load />
          </div>
        </ScrollReveal>
      )}

      {/* Usage in Course */}
      <ScrollReveal>
        <div className="md-card p-10">
          <h2 className="text-h2 font-bold text-ink mb-10">
            在课程中的应用
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {tool.usageInCourse.map((usage, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-bg-secondary rounded-xl"
              >
                <div className="w-16 h-16 flex items-center justify-center bg-accent text-white rounded-full font-bold text-xl">
                  W{usage.weekNumber}
                </div>
                <div className="flex-1">
                  <a
                    href={getUrl(`curriculum/week-${usage.weekNumber}`)}
                    className="text-lg font-semibold text-primary hover:text-accent transition-colors"
                  >
                    第 {usage.weekNumber} 周
                  </a>
                  <p className="text-text-secondary">{usage.role}</p>
                </div>
                <a
                  href={getUrl(`curriculum/week-${usage.weekNumber}`)}
                  className="text-accent hover:underline"
                >
                  查看详情 →
                </a>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Learning Materials */}
      {(tool.id === 'claude-code' || tool.id === 'notebooklm' || tool.id === 'cursor') && (
        <ScrollReveal>
          <div className="md-card p-10">
            <h2 className="text-h2 font-bold text-ink mb-10">深度学习资料</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {tool.id === 'claude-code' && (
                <>
                  <a
                    href={getUrl('materials/claude-code-architecture')}
                    className="md-card md-card-interactive p-6 group"
                    style={{ margin: 0 }}
                  >
                    <div className="text-4xl mb-4">🏗️</div>
                    <div className="font-bold text-body text-ink mb-2">架构深度分析</div>
                    <div className="text-ui text-slate">16个System Prompts完整解析</div>
                  </a>
                  <a
                    href={getUrl('materials/claude-code-setup')}
                    className="md-card md-card-interactive p-6 group"
                    style={{ margin: 0 }}
                  >
                    <div className="text-4xl mb-4">⚙️</div>
                    <div className="font-bold text-body text-ink mb-2">安装配置指南</div>
                    <div className="text-ui text-slate">快速上手完整教程</div>
                  </a>
                </>
              )}
              {tool.id === 'notebooklm' && (
                <a
                  href={getUrl('materials/notebooklm-guide')}
                  className="md-card md-card-interactive p-6 group"
                  style={{ margin: 0 }}
                >
                  <div className="text-4xl mb-4">📚</div>
                  <div className="font-bold text-body text-ink mb-2">NotebookLM 完全指南</div>
                  <div className="text-ui text-slate">1M上下文，全功能解析</div>
                </a>
              )}
              {(tool.id === 'cursor' || tool.id === 'claude-code') && (
                <a
                  href={getUrl('materials/ai-coding-tools-comparison')}
                  className="md-card md-card-interactive p-6 group"
                  style={{ margin: 0 }}
                >
                  <div className="text-4xl mb-4">🔧</div>
                  <div className="font-bold text-body text-ink mb-2">AI工具全景对比</div>
                  <div className="text-ui text-slate">Cursor vs Claude Code对比</div>
                </a>
              )}
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Related Resources */}
      <ScrollReveal>
        <div className="md-card p-10 text-center" style={{ background: 'linear-gradient(135deg, var(--md-sky) 0%, var(--md-sky-strong) 100%)', color: 'var(--md-cloud)' }}>
          <h2 className="text-h2 font-bold mb-6" style={{ color: 'var(--md-graphite)' }}>准备好开始了吗？</h2>
          <p className="text-body mb-8 max-w-2xl mx-auto" style={{ color: 'var(--md-graphite)', lineHeight: '1.6', opacity: 0.9 }}>
            在课程中深入学习 {tool.name}，掌握最前沿的 AI 辅助编程技能
          </p>
          <div className="md-cta-stack justify-center">
            <a href={getUrl('curriculum')} className="md-btn md-btn-secondary">
              查看课程大纲
            </a>
            <a
              href={tool.officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="md-btn"
            >
              访问 {tool.name} 官网
            </a>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
