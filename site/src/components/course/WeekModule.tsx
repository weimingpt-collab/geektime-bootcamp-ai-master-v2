import { useState } from 'react';
import { motion } from 'framer-motion';
import ExpandableSection from '../ui/ExpandableSection';
import AnimatedDiagram from '../diagrams/AnimatedDiagram';
import { getUrl } from '../../utils/url';

interface WeekModuleProps {
  weekNumber: number;
  title: string;
  subtitle: string;
  objectives: string[];
  keyPoints: { title: string; description: string; diagram?: string }[];
  practicalContent: string[];
  relatedTools: string[];
  estimatedHours: number;
}

export default function WeekModule({
  weekNumber,
  title,
  subtitle,
  objectives,
  keyPoints,
  practicalContent,
  relatedTools,
  estimatedHours,
}: WeekModuleProps) {
  const [activeTab, setActiveTab] = useState<'objectives' | 'keyPoints' | 'practice'>(
    'objectives'
  );

  const tabs = [
    { id: 'objectives' as const, label: '学习目标' },
    { id: 'keyPoints' as const, label: '知识点' },
    { id: 'practice' as const, label: '实践内容' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden"
      style={{
        backgroundColor: 'var(--md-white)',
        borderRadius: 0,
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      {/* Header */}
      <div
        className="text-white p-10"
        style={{
          background: 'linear-gradient(135deg, var(--md-sky) 0%, var(--md-sky-strong) 100%)',
        }}
      >
        <div className="flex items-center gap-4 mb-8">
          <span className="font-bold md-badge text-ui" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'var(--md-cloud)' }}>
            第 {weekNumber} 周
          </span>
          <span className="text-ui" style={{ opacity: 0.9 }}>
            ⏱ {estimatedHours} 小时
          </span>
        </div>

        <h1 className="font-bold text-h1 mb-4">
          {title}
        </h1>
        <p className="mb-0 text-body" style={{ opacity: 0.9, lineHeight: '1.7', fontSize: '17px' }}>
          {subtitle}
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b-2 border-graphite px-10">
        <div className="flex gap-10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 text-ui font-bold border-b-2 transition-all duration-200 ${activeTab === tab.id ? 'border-sky text-sky' : 'border-transparent text-slate'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-10">
        {activeTab === 'objectives' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {objectives.map((objective, index) => (
              <div
                key={index}
                className="flex gap-5"
                style={{ marginBottom: index < objectives.length - 1 ? 'var(--space-5)' : 0 }}
              >
                <span className="text-xl text-garden">✓</span>
                <p className="flex-1 mb-0 text-body text-ink" style={{ lineHeight: '1.7', fontSize: '17px' }}>
                  {objective}
                </p>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'keyPoints' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {keyPoints.map((point, index) => (
              <div
                key={index}
                style={{ marginBottom: index < keyPoints.length - 1 ? 'var(--space-4)' : 0 }}
              >
                <ExpandableSection title={point.title}>
                  <p className="text-body text-slate mb-4" style={{ lineHeight: '1.6' }}>
                    {point.description}
                  </p>
                  {point.diagram && <AnimatedDiagram code={point.diagram} />}
                </ExpandableSection>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'practice' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {practicalContent.map((content, index) => (
              <div
                key={index}
                className="flex gap-5"
                style={{ marginBottom: index < practicalContent.length - 1 ? 'var(--space-5)' : 0 }}
              >
                <span className="font-bold text-watermelon">{index + 1}.</span>
                <p className="flex-1 mb-0 text-body text-ink" style={{ lineHeight: '1.7', fontSize: '17px' }}>
                  {content}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <div className="pt-0 px-10 pb-10">
          <h3 className="font-bold text-body text-slate mb-5">
            相关工具
          </h3>
          <div className="flex flex-wrap gap-3">
            {relatedTools.map((tool) => (
              <a
                key={tool}
                href={getUrl(`tools/${tool}`)}
                className="transition-all duration-200 md-badge md-badge-sky hover:scale-105"
                style={{
                  cursor: 'pointer',
                }}
              >
                {tool}
              </a>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
