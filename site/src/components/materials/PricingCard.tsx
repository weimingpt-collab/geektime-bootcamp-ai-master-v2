import { useState } from 'react';

interface PricingInfo {
  input?: number | string;
  output?: number | string;
  features?: string[];
  limits?: Record<string, string>;
}

interface PricingCardProps {
  provider: string;
  color?: string;
  pricing: PricingInfo;
  popular?: boolean;
  icon?: string;
}

export default function PricingCard({
  provider,
  color = '#6FC2FF',
  pricing = {},
  popular = false,
  icon = '🤖',
}: PricingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="relative md-card md-card-interactive"
      style={{
        borderTop: popular ? `4px solid ${color}` : undefined,
        backgroundColor: popular ? `${color}05` : 'var(--md-white)',
      }}
    >
      {/* Popular Badge */}
      {popular && (
        <div
          className="md-badge md-badge-sun absolute -top-3 right-lg"
          style={{
            fontSize: 'var(--font-tiny)',
          }}
        >
          ⭐ 最受欢迎
        </div>
      )}

      {/* Header */}
      <div className="text-center" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="text-5xl" style={{ marginBottom: 'var(--space-md)' }}>{icon}</div>
        <h3
          className="text-h3 font-bold"
          style={{
            color: 'var(--md-neutral-900)',
            marginTop: 0,
            marginBottom: 0,
          }}
        >
          {provider}
        </h3>
      </div>

      {/* Pricing Models */}
      <div
        className="grid grid-cols-2"
        style={{
          gap: 'var(--space-lg)',
          marginBottom: 'var(--space-xl)',
        }}
      >
        {pricing.input && (
          <div
            className="text-center p-lg"
            style={{ borderRadius: 0 }}
            style={{
              backgroundColor: 'var(--md-neutral-100)',
            }}
          >
            <div
              className="text-tiny mb-sm"
              style={{ color: 'var(--md-neutral-700)' }}
            >
              输入价格
            </div>
            <div className="flex items-baseline justify-center">
              <span
                className="text-small"
                style={{ color: 'var(--md-neutral-700)' }}
              >
                $
              </span>
              <span
                className="text-h2 font-bold mx-1"
                style={{ color: color }}
              >
                {pricing.input}
              </span>
              <span
                className="text-tiny"
                style={{ color: 'var(--md-neutral-700)' }}
              >
                /M tokens
              </span>
            </div>
          </div>
        )}

        {pricing.output && (
          <div
            className="text-center p-lg"
            style={{ borderRadius: 0 }}
            style={{
              backgroundColor: 'var(--md-neutral-100)',
            }}
          >
            <div
              className="text-tiny mb-sm"
              style={{ color: 'var(--md-neutral-700)' }}
            >
              输出价格
            </div>
            <div className="flex items-baseline justify-center">
              <span
                className="text-small"
                style={{ color: 'var(--md-neutral-700)' }}
              >
                $
              </span>
              <span
                className="text-h2 font-bold mx-1"
                style={{ color: color }}
              >
                {pricing.output}
              </span>
              <span
                className="text-tiny"
                style={{ color: 'var(--md-neutral-700)' }}
              >
                /M tokens
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Features */}
      {pricing.features && (
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <ul style={{
            marginTop: 0,
            marginBottom: 0,
            paddingLeft: 0,
            listStyle: 'none',
          }}>
            {pricing.features
              .slice(0, isExpanded ? pricing.features.length : 3)
              .map((feature, idx) => (
                <li
                  key={idx}
                  className="flex items-start"
                  style={{
                    gap: 'var(--space-sm)',
                    marginBottom: idx < (isExpanded ? pricing.features.length : 3) - 1 ? 'var(--space-sm)' : 0,
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

          {pricing.features.length > 3 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-small font-medium transition-all duration-200 hover:translate-x-1"
              style={{
                color: color,
                marginTop: 'var(--space-md)',
                marginBottom: 0,
              }}
            >
              {isExpanded
                ? '收起 ↑'
                : `查看更多 (${pricing.features.length - 3}) →`}
            </button>
          )}
        </div>
      )}

      {/* Limits */}
      {pricing.limits && (
        <div
          className="border-t"
          style={{
            borderColor: 'var(--md-neutral-300)',
            paddingTop: 'var(--space-lg)',
          }}
        >
          <h5
            className="text-small font-semibold"
            style={{
              color: 'var(--md-neutral-900)',
              marginTop: 0,
              marginBottom: 'var(--space-md)',
            }}
          >
            使用限制
          </h5>
          <div>
            {Object.entries(pricing.limits).map(([key, value], idx) => (
              <div
                key={key}
                className="flex justify-between items-center"
                style={{
                  marginBottom: idx < Object.keys(pricing.limits!).length - 1 ? 'var(--space-sm)' : 0,
                }}
              >
                <span
                  className="text-small"
                  style={{
                    color: 'var(--md-neutral-700)',
                    lineHeight: 'var(--line-height-body)',
                  }}
                >
                  {key}:
                </span>
                <span
                  className="text-small font-medium"
                  style={{
                    color: 'var(--md-neutral-900)',
                    lineHeight: 'var(--line-height-body)',
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
