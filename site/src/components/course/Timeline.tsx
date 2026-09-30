import { motion } from 'framer-motion';
import ScrollReveal from '../ui/ScrollReveal';
import { getUrl } from '../../utils/url';

interface TimelineItem {
  weekNumber: number;
  title: string;
  subtitle: string;
  href?: string;
}

interface TimelineProps {
  items: TimelineItem[];
}

export default function Timeline({ items }: TimelineProps) {
  return (
    <div className="mx-auto max-w-4xl">
      {items.map((item, index) => (
        <ScrollReveal key={item.weekNumber} delay={index * 0.1}>
          <div className="flex relative gap-1" style={{ paddingBottom: index < items.length - 1 ? 'var(--space-10)' : 0 }}>
            {/* Timeline line */}
            <div className="flex relative flex-col items-center">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="z-10 w-4 h-4 bg-sky"
                style={{ borderRadius: 0 }}
              />
              {index < items.length - 1 && (
                <motion.div
                  initial={{ height: 0 }}
                  whileInView={{ height: '100%' }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                  className="absolute w-0.5 top-4"
                  style={{
                    background: 'linear-gradient(to bottom, var(--md-sky), transparent)',
                  }}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 group">
              <a
                href={item.href || getUrl(`curriculum/week-${item.weekNumber}`)}
                className="block p-6 md-card md-card-interactive"
              >
                <div className="flex gap-4 items-center mb-3">
                  <span className="font-bold text-ui text-sky">
                    第 {item.weekNumber} 周
                  </span>
                  <span className="text-eyebrow text-slate">→</span>
                </div>
                <h3 className="mb-3 font-bold transition-colors text-h3 text-ink group-hover:text-sky">
                  {item.title}
                </h3>
                <p className="mb-0 text-body text-slate" style={{ lineHeight: '1.6' }}>
                  {item.subtitle}
                </p>
              </a>
            </div>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}
