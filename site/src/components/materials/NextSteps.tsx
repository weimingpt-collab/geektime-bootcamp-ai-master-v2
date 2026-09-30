import { getUrl } from '../../utils/url';

interface NextStepLink {
  title: string;
  description: string;
  icon: string;
  href: string;
  external?: boolean;
}

interface NextStepsProps {
  title?: string;
  links: NextStepLink[];
}

export default function NextSteps({ title = '📚 下一步', links }: NextStepsProps) {
  return (
    <div style={{ marginTop: 'var(--space-12)', marginBottom: 'var(--space-12)' }}>
      <h2
        className="font-bold text-h2 text-ink"
        style={{ marginBottom: 'var(--space-8)' }}
      >
        {title}
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'var(--space-8)'
        }}
      >
        {links.map((link, index) => (
          <a
            key={index}
            href={getUrl(link.href)}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noopener noreferrer" : undefined}
            className="md-card md-card-interactive"
            style={{
              padding: 'var(--space-8)',
              textDecoration: 'none',
              color: 'var(--md-ink)',
              margin: 0
            }}
          >
            <div
              style={{
                fontSize: '2rem',
                marginBottom: 'var(--space-4)'
              }}
            >
              {link.icon}
            </div>
            <div
              style={{
                fontSize: 'var(--font-body)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--md-sky)',
                marginBottom: 'var(--space-3)'
              }}
            >
              {link.title}
            </div>
            <div
              style={{
                fontSize: 'var(--font-body)',
                color: 'var(--md-slate)',
                lineHeight: '1.5'
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
