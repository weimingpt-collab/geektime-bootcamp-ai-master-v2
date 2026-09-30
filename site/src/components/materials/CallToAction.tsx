interface CallToActionProps {
  title: string;
  subtitle?: string;
  gradient?: string;
}

export default function CallToAction({
  title,
  subtitle,
  gradient = 'linear-gradient(135deg, var(--md-sky) 0%, var(--md-sky-strong) 100%)'
}: CallToActionProps) {
  return (
    <div
      style={{
        textAlign: 'center',
        marginTop: 'var(--space-12)',
        padding: 'var(--space-10)',
        background: gradient,
        borderRadius: 0,
        border: '2px solid var(--md-graphite)'
      }}
    >
      <p
        style={{
          color: 'var(--md-graphite)',
          fontSize: 'var(--font-h3)',
          fontWeight: 'var(--font-weight-bold)',
          margin: 0,
          lineHeight: '1.4'
        }}
      >
        ✨ {title} ✨
      </p>
      {subtitle && (
        <p
          style={{
            color: 'var(--md-graphite)',
            fontSize: 'var(--font-body)',
            margin: 'var(--space-4) 0 0 0',
            opacity: 0.9,
            lineHeight: '1.6'
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
