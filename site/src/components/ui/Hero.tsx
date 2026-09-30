import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface HeroProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  backgroundClass?: string;
  backgroundImage?: string;
}

export default function Hero({
  title,
  subtitle,
  children,
  backgroundClass = 'bg-md-hero',
  backgroundImage,
}: HeroProps) {
  const sectionStyle = backgroundImage
    ? {
      backgroundImage: `linear-gradient(135deg, rgba(255, 222, 0, 0.4) 0%, rgba(111, 194, 255, 0.25) 100%), url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
    : {};

  return (
    <section className={`relative flex min-h-screen items-center ${backgroundClass}`} style={sectionStyle}>
      <div className="md-container text-center" style={{ paddingTop: 'var(--space-section)', paddingBottom: 'var(--space-section)' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-hero font-bold uppercase tracking-[0.08em] mb-7"
            style={{
              color: 'var(--md-ink)',
              textShadow: '2px 2px 4px rgba(255, 255, 255, 0.8), -1px -1px 2px rgba(255, 255, 255, 0.5)',
            }}
          >
            {title}
          </motion.h1>

          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto max-w-3xl text-body mb-9"
              style={{
                color: 'var(--md-ink)',
                fontSize: '18px',
                lineHeight: '1.6',
                textShadow: '1px 1px 2px rgba(255, 255, 255, 0.8)',
              }}
            >
              {subtitle}
            </motion.p>
          )}

          {children && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="md-cta-stack justify-center"
            >
              {children}
            </motion.div>
          )}
        </motion.div>

        {/* 装饰性元素 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{ zIndex: -1 }}
        >
          <div className="absolute -left-10 -top-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(111,194,255,0.2)_0%,transparent_70%)] blur-3xl" />
          <div className="absolute -bottom-20 -right-10 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(255,222,0,0.2)_0%,transparent_70%)] blur-3xl" />
        </motion.div>
      </div>
    </section>
  );
}
