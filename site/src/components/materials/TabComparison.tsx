import { useState } from 'react';
import type { ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
  icon?: string;
  color?: string;
}

interface TabComparisonProps {
  tabs: Tab[];
  defaultTab?: string;
}

export default function TabComparison({ tabs = [], defaultTab }: TabComparisonProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const activeContent = tabs.find(tab => tab.id === activeTab)

  return (
    <div className="tab-comparison">
      <div className="tab-comparison-header">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ '--tab-color': tab.color }}
          >
            {tab.icon && <span className="tab-icon">{tab.icon}</span>}
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="tab-comparison-content">
        {activeContent?.content}
      </div>
    </div>
  )
}
