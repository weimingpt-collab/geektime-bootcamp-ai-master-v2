import { useState } from 'react';

/**
 * ComparisonCard - 对比卡片组件（MotherDuck 风格）
 */

interface ComparisonCardProps {
  provider: string;
  logo: string;
  color?: string;
  tagline: string;
  features: string[];
  metrics?: Record<string, string>;
  highlight?: boolean;
}

export default function ComparisonCard({
  provider,
  logo,
  color = '#6FC2FF',
  tagline,
  features = [],
  metrics = {},
  highlight = false,
}: ComparisonCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="md-card md-card-interactive relative"
      style={{
        borderTop: highlight ? `4px solid ${color}` : undefined,
        backgroundColor: highlight ? 'rgba(111, 194, 255, 0.02)' : 'var(--md-white)',
      }}
    >
      {highlight && (
        <div
          className="md-badge md-badge-sun absolute -top-3 right-lg"
          style={{
            fontSize: 'var(--font-tiny)',
          }}
        >
          ⭐ 推荐
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="text-4xl" style={{ marginBottom: 'var(--space-md)' }}>{logo}</div>
        <h3
          className="text-h3 font-bold"
          style={{
            color: 'var(--md-neutral-900)',
            marginTop: 0,
            marginBottom: 'var(--space-sm)',
          }}
        >
          {provider}
        </h3>
        <p
          className="text-body"
          style={{
            color: color,
            marginTop: 0,
            marginBottom: 0,
            lineHeight: 'var(--line-height-body)',
          }}
        >
          {tagline}
        </p>
      </div>

      {/* Metrics */}
      {Object.keys(metrics).length > 0 && (
        <div
          className="grid grid-cols-2 gap-md p-md"
          style={{
            borderRadius: 0,
            backgroundColor: 'var(--md-neutral-100)',
            marginBottom: 'var(--space-lg)',
          }}
        >
          {Object.entries(metrics).map(([key, value]) => (
            <div key={key} className="text-center">
              <div
                className="text-tiny mb-xs"
                style={{ color: 'var(--md-neutral-700)' }}
              >
                {key}
              </div>
              <div
                className="text-body font-semibold"
                style={{ color: 'var(--md-neutral-900)' }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Features */}
      <div>
        <h4
          className="text-body font-semibold"
          style={{
            color: 'var(--md-neutral-900)',
            marginTop: 0,
            marginBottom: 'var(--space-md)',
          }}
        >
          核心特性
        </h4>
        <ul style={{
          marginTop: 0,
          marginBottom: 0,
          paddingLeft: 0,
          listStyle: 'none',
        }}>
          {features
            .slice(0, isExpanded ? features.length : 4)
            .map((feature, idx) => (
              <li
                key={idx}
                className="flex items-start"
                style={{
                  gap: 'var(--space-sm)',
                  marginBottom: idx < (isExpanded ? features.length : 4) - 1 ? 'var(--space-sm)' : 0,
                }}
              >
                <span
                  className="text-small"
                  style={{ color: color }}
                >
                  ✓
                </span>
                <span
                  className="text-small flex-1"
                  style={{
                    color: 'var(--md-neutral-700)',
                    lineHeight: 'var(--line-height-body)',
                  }}
                >
                  {feature}
                </span>
              </li>
            ))}
        </ul>
      </div>

      {/* Toggle Button */}
      {features.length > 4 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-small font-medium transition-all duration-200 hover:translate-x-1"
          style={{
            color: color,
            marginTop: 'var(--space-lg)',
            marginBottom: 0,
          }}
        >
          {isExpanded ? '收起 ↑' : `查看全部 ${features.length} 项特性 →`}
        </button>
      )}
    </div>
  );
}
