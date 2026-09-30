import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode | string;
  title: string;
  description: string;
  delay?: number;
}

export default function FeatureCard({
  icon,
  title,
  description,
  delay = 0,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="md-card md-card-interactive group"
    >
      <div
        className="text-5xl transition-transform duration-300 group-hover:scale-110 mb-6"
        style={{
          filter: 'drop-shadow(0 4px 6px rgba(255, 113, 105, 0.2))',
        }}
      >
        {typeof icon === 'string' ? icon : icon}
      </div>
      <h3 className="text-h3 font-bold text-ink mb-4">
        {title}
      </h3>
      <p className="text-body text-slate mb-0" style={{ lineHeight: '1.6' }}>
        {description}
      </p>

    </motion.div>
  );
}
