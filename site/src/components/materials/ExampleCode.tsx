import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import prism from 'react-syntax-highlighter/dist/cjs/styles/prism/prism';

interface ExampleCodeProps {
  title?: string;
  language?: string;
  code: string;
  defaultExpanded?: boolean;
  showLineNumbers?: boolean;
  previewLines?: number;
}

export default function ExampleCode({
  title = 'Example Code',
  language = 'markdown',
  code,
  defaultExpanded = false,
  showLineNumbers = true,
  previewLines = 5,
}: ExampleCodeProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);
  // Fix hydration mismatch: only render syntax highlighter on client
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get preview text (first N lines)
  const lines = code.split('\n');
  const previewCode = lines.slice(0, previewLines).join('\n');
  const hasMore = lines.length > previewLines;

  return (
    <div
      className="md-card"
      style={{
        marginTop: 'var(--space-4)',
        marginBottom: 'var(--space-4)',
        padding: 0,
        overflow: 'hidden'
      }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex justify-between items-center w-full transition-all duration-200 group hover:bg-sky-strong"
        style={{
          padding: 'var(--space-2) var(--space-3)',
          backgroundColor: 'var(--md-sky)',
          border: '2px solid var(--md-graphite)',
          cursor: 'pointer'
        }}
      >
        <div className="flex items-center" style={{ gap: 'var(--space-4)' }}>
          <span
            className="font-bold text-ink"
            style={{ fontSize: 'var(--font-body)' }}
          >
            {title}
          </span>
          <span
            className="text-ink"
            style={{
              display: 'inline-block',
              fontSize: 'var(--font-tiny)',
              padding: '1px var(--space-1)',
              backgroundColor: 'var(--md-sunbeam)',
              border: '1px solid var(--md-graphite)',
              fontFamily: 'monospace',
              fontWeight: 'var(--font-weight-bold)'
            }}
          >
            {language}
          </span>
        </div>
        <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
          <span
            className="font-bold text-ink"
            style={{ fontSize: 'var(--font-ui)' }}
          >
            {isExpanded ? '收起' : '展开'}
          </span>
          <svg
            className="transition-transform duration-200"
            style={{
              width: '20px',
              height: '20px',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              color: 'var(--md-ink)'
            }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Preview (collapsed state) */}
      {!isExpanded && (
        <div
          style={{ position: 'relative', cursor: 'pointer' }}
          onClick={() => setIsExpanded(true)}
        >
          {mounted ? (
            <SyntaxHighlighter
              language={language}
              style={prism}
              showLineNumbers={showLineNumbers}
              customStyle={{
                margin: 0,
                borderRadius: 0,
                padding: 'var(--space-5)',
                backgroundColor: 'var(--md-fog)',
              }}
              lineNumberStyle={{
                minWidth: '2.5em',
                paddingRight: '1em',
                color: 'var(--md-slate)',
                userSelect: 'none',
              }}
              codeTagProps={{
                style: {
                  fontSize: '18px',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                }
              }}
            >
              {previewCode}
            </SyntaxHighlighter>
          ) : (
            <pre
              style={{
                margin: 0,
                borderRadius: 0,
                padding: 'var(--space-5)',
                backgroundColor: 'var(--md-fog)',
                fontSize: '18px',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                overflow: 'auto',
              }}
            >
              <code>{previewCode}</code>
            </pre>
          )}
          {hasMore && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '80px',
                background: 'linear-gradient(to bottom, transparent, var(--md-fog))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingBottom: 'var(--space-3)',
                pointerEvents: 'none'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--space-2)'
                }}
              >
                <span
                  style={{
                    color: 'var(--md-ink)',
                    fontSize: 'var(--font-body)',
                    fontWeight: 'var(--font-weight-bold)'
                  }}
                >
                  点击展开查看完整代码
                </span>
                <span
                  style={{
                    color: 'var(--md-slate)',
                    fontSize: 'var(--font-ui)'
                  }}
                >
                  共 {lines.length} 行
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full code (expanded state) */}
      {isExpanded && (
        <div style={{ position: 'relative' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="flex items-center transition-all duration-200 hover:bg-sky-strong"
            style={{
              position: 'absolute',
              top: 'var(--space-4)',
              right: 'var(--space-4)',
              padding: 'var(--space-2) var(--space-4)',
              backgroundColor: copied ? 'var(--md-sky-strong)' : 'var(--md-sky)',
              color: 'var(--md-graphite)',
              fontSize: 'var(--font-ui)',
              fontWeight: 'var(--font-weight-bold)',
              border: '2px solid var(--md-graphite)',
              zIndex: 10,
              gap: 'var(--space-2)',
              cursor: 'pointer'
            }}
            title={copied ? '已复制' : '复制代码'}
          >
            {copied ? (
              <>
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                已复制
              </>
            ) : (
              <>
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                复制
              </>
            )}
          </button>
          {mounted ? (
            <SyntaxHighlighter
              language={language}
              style={prism}
              showLineNumbers={showLineNumbers}
              customStyle={{
                margin: 0,
                borderRadius: 0,
                padding: 'var(--space-5)',
                backgroundColor: 'var(--md-fog)',
              }}
              lineNumberStyle={{
                minWidth: '2.5em',
                paddingRight: '1em',
                color: 'var(--md-slate)',
                userSelect: 'none',
              }}
              codeTagProps={{
                style: {
                  fontSize: '18px',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                }
              }}
            >
              {code}
            </SyntaxHighlighter>
          ) : (
            <pre
              style={{
                margin: 0,
                borderRadius: 0,
                padding: 'var(--space-5)',
                backgroundColor: 'var(--md-fog)',
                fontSize: '18px',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                overflow: 'auto',
              }}
            >
              <code>{code}</code>
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
