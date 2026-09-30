import { motion } from 'framer-motion';
import { getUrl } from '../../utils/url';

interface WeekItem {
  week: string;
  description: string;
}

interface ReadingLink {
  title: string;
  description: string;
  href: string;
  external?: boolean;
}

interface LearningSuggestionProps {
  weeks: WeekItem[];
  readings: ReadingLink[];
}

export default function LearningSuggestion({ weeks, readings }: LearningSuggestionProps) {
  return (
    <div
      className="md-card"
      style={{
        backgroundColor: 'var(--md-cloud)',
        padding: 'var(--space-10)',
        marginTop: 'var(--space-12)',
        marginBottom: 'var(--space-12)'
      }}
    >
      <h2
        className="font-bold text-h2 text-ink"
        style={{ marginBottom: 'var(--space-8)' }}
      >
        🎓 学习建议
      </h2>

      <h3
        className="font-bold text-h3 text-ink"
        style={{ marginBottom: 'var(--space-5)' }}
      >
        循序渐进
      </h3>

      <div style={{ marginBottom: 'var(--space-8)' }}>
        {weeks.map((item, index) => (
          <div
            key={index}
            style={{
              marginBottom: index < weeks.length - 1 ? 'var(--space-4)' : 0,
              fontSize: 'var(--font-body)',
              lineHeight: '1.6',
              color: 'var(--md-slate)'
            }}
          >
            <strong style={{ color: 'var(--md-ink)' }}>{item.week}</strong>: {item.description}
          </div>
        ))}
      </div>

      <h3
        className="font-bold text-h3 text-ink"
        style={{ marginBottom: 'var(--space-5)' }}
      >
        延伸阅读
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'var(--space-8)'
        }}
      >
        {readings.map((link, index) => (
          <a
            key={index}
            href={getUrl(link.href)}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noopener noreferrer" : undefined}
            className="md-card md-card-interactive"
            style={{
              padding: 'var(--space-6)',
              textDecoration: 'none',
              color: 'var(--md-ink)',
              margin: 0
            }}
          >
            <div
              style={{
                fontSize: 'var(--font-body)',
                fontWeight: 'var(--font-weight-bold)',
                marginBottom: 'var(--space-2)',
                color: 'var(--md-ink)'
              }}
            >
              {link.title}
            </div>
            <div
              style={{
                fontSize: 'var(--font-ui)',
                color: 'var(--md-slate)',
                lineHeight: '1.4'
              }}
            >
              {link.description}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
