import { useState } from 'react';

interface Provider {
  name: string;
  logo: string;
}

interface Feature {
  key: string;
  name: string;
  description?: string;
  notes?: Record<string, string>;
}

interface FeatureGridProps {
  providers: Provider[];
  features: Feature[];
  support: Record<string, Record<string, boolean | string>>;
}

export default function FeatureGrid({ providers = [], features = [], support = {} }: FeatureGridProps) {
  const [selectedFeature, setSelectedFeature] = useState(null)

  const getSupportStatus = (provider, feature) => {
    return support[provider]?.[feature] || false
  }

  const getSupportIcon = (status) => {
    if (status === true) return '✓'
    if (status === 'partial') return '◐'
    return '✗'
  }

  const getSupportClass = (status) => {
    if (status === true) return 'supported'
    if (status === 'partial') return 'partial'
    return 'not-supported'
  }

  return (
    <div className="feature-grid-container">
      <div className="feature-grid">
        <div className="feature-grid-header">
          <div className="feature-grid-cell header-cell corner-cell">功能特性</div>
          {providers.map(provider => (
            <div key={provider.name} className="feature-grid-cell header-cell provider-cell">
              <div className="provider-logo">{provider.logo}</div>
              <div className="provider-name">{provider.name}</div>
            </div>
          ))}
        </div>

        <div className="feature-grid-body">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`feature-grid-row ${selectedFeature === idx ? 'selected' : ''}`}
              onMouseEnter={() => setSelectedFeature(idx)}
              onMouseLeave={() => setSelectedFeature(null)}
            >
              <div className="feature-grid-cell feature-name-cell">
                <div className="feature-name">{feature.name}</div>
                {feature.description && (
                  <div className="feature-description">{feature.description}</div>
                )}
              </div>

              {providers.map(provider => {
                const status = getSupportStatus(provider.name, feature.key)
                return (
                  <div
                    key={provider.name}
                    className={`feature-grid-cell support-cell ${getSupportClass(status)}`}
                  >
                    <span className="support-icon">{getSupportIcon(status)}</span>
                    {status === 'partial' && feature.notes?.[provider.name] && (
                      <span className="support-note">{feature.notes[provider.name]}</span>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="feature-grid-legend">
        <div className="legend-item">
          <span className="legend-icon supported">✓</span>
          <span>完全支持</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon partial">◐</span>
          <span>部分支持</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon not-supported">✗</span>
          <span>不支持</span>
        </div>
      </div>
    </div>
  )
}
