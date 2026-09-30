import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { motion } from 'framer-motion';

interface AnimatedDiagramProps {
  code: string;
  className?: string;
}

// Initialize mermaid with custom color palette
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    // Custom color palette
    primaryColor: '#f5cbc5', // Light pink/beige
    primaryTextColor: '#1d1d1f',
    primaryBorderColor: '#b3272c', // Dark red

    // Secondary colors
    secondaryColor: '#d3f9b5', // Light green
    secondaryTextColor: '#1d1d1f',
    secondaryBorderColor: '#772d8b', // Dark purple

    // Tertiary
    tertiaryColor: '#f5cbc5',
    tertiaryTextColor: '#1d1d1f',
    tertiaryBorderColor: '#77a0a9', // Muted teal

    // Background
    background: '#ffffff',
    mainBkg: '#ffffff',
    secondBkg: '#f5f5f7',
    textColor: '#1d1d1f',

    // Lines and connections
    lineColor: '#772d8b', // Dark purple
    arrowheadColor: '#772d8b',
    defaultLinkColor: '#772d8b',

    // Font
    fontSize: '16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif',

    // Node borders
    nodeBorder: '#772d8b',
    clusterBkg: '#f5cbc5',
    clusterBorder: '#b3272c',
    edgeLabelBackground: '#ffffff',

    // Accent colors
    pie1: '#b3272c',
    pie2: '#f5cbc5',
    pie3: '#772d8b',
    pie4: '#77a0a9',
    pie5: '#d3f9b5',
    pie6: '#b3272c',
  },
  flowchart: {
    htmlLabels: false, // Disable to allow color property to work
    curve: 'basis',
    padding: 25,
    nodeSpacing: 80,
    rankSpacing: 80,
    useMaxWidth: true,
  },
});

export default function AnimatedDiagram({ code, className = '' }: AnimatedDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const renderDiagram = async () => {
      if (!ref.current || !code) return;

      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, code);
        setSvg(svg);
        setError('');
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError('Failed to render diagram');
      }
    };

    renderDiagram();
  }, [code]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
        {error}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`flex justify-center items-center ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
