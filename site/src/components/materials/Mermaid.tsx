import { useEffect, useRef, useState, useMemo } from 'react';
import mermaid from 'mermaid';
import ImageModal from './ImageModal';

// Initialize mermaid with custom color palette
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    // Custom color palette from user
    primaryColor: '#f5cbc5', // Light pink/beige
    primaryTextColor: '#1d1d1f',
    primaryBorderColor: '#b3272c', // Dark red

    // Secondary colors
    secondaryColor: '#d3f9b5', // Light green
    secondaryTextColor: '#1d1d1f',
    secondaryBorderColor: '#772d8b', // Dark purple

    // Tertiary colors
    tertiaryColor: '#f5cbc5',
    tertiaryTextColor: '#1d1d1f',
    tertiaryBorderColor: '#77a0a9', // Muted teal

    // Background and text
    background: '#ffffff',
    mainBkg: '#ffffff',
    secondBkg: '#f5f5f7',
    textColor: '#1d1d1f',
    border1: '#e5e5e5',
    border2: '#e5e5e5',

    // Lines and connections
    lineColor: '#772d8b', // Dark purple for connections
    arrowheadColor: '#772d8b',

    // Font
    fontSize: '16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif',

    // Node styling
    nodeBorder: '#772d8b',
    nodeTextColor: '#1d1d1f',

    // Cluster/subgraph
    clusterBkg: '#f5cbc5',
    clusterBorder: '#b3272c',

    // Labels and edges
    defaultLinkColor: '#772d8b',
    titleColor: '#1d1d1f',
    edgeLabelBackground: '#ffffff',

    // Sequence diagram
    actorBkg: '#f5cbc5',
    actorBorder: '#b3272c',
    actorTextColor: '#1d1d1f',
    actorLineColor: '#772d8b',
    signalColor: '#1d1d1f',
    signalTextColor: '#1d1d1f',
    labelBoxBkgColor: '#d3f9b5',
    labelBoxBorderColor: '#772d8b',
    labelTextColor: '#1d1d1f',
    loopTextColor: '#1d1d1f',
    noteBorderColor: '#77a0a9',
    noteBkgColor: '#d3f9b5',
    noteTextColor: '#1d1d1f',
    activationBorderColor: '#b3272c',
    activationBkgColor: '#f5cbc5',
    sequenceNumberColor: '#ffffff',

    // Pie chart colors - custom palette
    pie1: '#b3272c',
    pie2: '#f5cbc5',
    pie3: '#772d8b',
    pie4: '#77a0a9',
    pie5: '#d3f9b5',
    pie6: '#b3272c',
    pie7: '#772d8b',
    pie8: '#77a0a9',
    pie9: '#d3f9b5',
    pie10: '#f5cbc5',
    pie11: '#b3272c',
    pie12: '#772d8b',

    // Git graph
    git0: '#b3272c',
    git1: '#772d8b',
    git2: '#77a0a9',
    git3: '#d3f9b5',
    git4: '#f5cbc5',
    git5: '#b3272c',
    git6: '#772d8b',
    git7: '#77a0a9',

    // Additional
    errorBkgColor: '#f5cbc5',
    errorTextColor: '#b3272c',
  },
  flowchart: {
    htmlLabels: false, // Disable to allow color property to work
    curve: 'basis',
    padding: 25,
    nodeSpacing: 80,
    rankSpacing: 80,
    diagramPadding: 25,
    useMaxWidth: true,
  },
  sequence: {
    diagramMarginX: 50,
    diagramMarginY: 20,
    actorMargin: 50,
    width: 160,
    height: 75,
    boxMargin: 10,
    noteMargin: 10,
    messageMargin: 35,
    useMaxWidth: true,
  },
  timeline: {
    diagramMarginX: 50,
    diagramMarginY: 20,
    useMaxWidth: true,
  },
});

interface MermaidProps {
  chart: string;
}

export default function Mermaid({ chart }: MermaidProps) {
  const [svg, setSvg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Use useId for stable ID generation, or fallback to random for older React
  const id = useMemo(() => `mermaid-${Math.random().toString(36).substr(2, 9)}`, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const renderDiagram = async () => {
      try {
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
        setError(null);
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError((err as Error).message || '渲染失败');
      }
    };

    if (chart) {
      renderDiagram();
    }
  }, [chart, id, mounted]);

  if (error) {
    return (
      <div className="mermaid-container">
        <div
          style={{
            padding: '1rem',
            background: '#fee',
            border: '1px solid #fcc',
            borderRadius: '0.25rem',
            color: '#c00',
          }}
        >
          <strong>图表渲染失败</strong>
          <pre
            style={{
              marginTop: '0.5rem',
              fontSize: '0.85em',
              whiteSpace: 'pre-wrap',
            }}
          >
            {error}
          </pre>
        </div>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="mermaid-container">
        <div style={{ padding: '2rem', color: '#999' }}>正在加载图表...</div>
      </div>
    );
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="mermaid-container">
        <button
          className="mermaid-zoom-button"
          onClick={handleClick}
          title="点击放大查看"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </button>
        <div
          className="mermaid-svg-wrapper"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>

      <ImageModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div
          className="mermaid-modal-content"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </ImageModal>
    </>
  );
}
