import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from '../ui/ScrollReveal';
import { getUrl } from '../../utils/url';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface ToolShowcaseProps {
  id: string;
  name: string;
  tagline: string;
  description: string;
  features: Feature[];
  href?: string;
  reverse?: boolean;
  imageUrl?: string;
}

export default function ToolShowcase({
  id,
  name,
  tagline,
  description,
  features,
  href,
  reverse = false,
  imageUrl,
}: ToolShowcaseProps) {
  return (
    <div
      className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'
        } gap-12 items-center md-card`}
      style={{ backgroundColor: 'var(--md-cloud)', padding: 'var(--space-10)' }}
    >
      {/* Image/Icon */}
      <ScrollReveal
        animation={reverse ? 'slideInRight' : 'slideInLeft'}
        className="flex-1"
      >
        <div className="relative aspect-square max-w-md mx-auto">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full overflow-hidden"
            style={{
              boxShadow: 'var(--shadow-xl)',
              borderRadius: 0,
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  background: 'var(--md-gradient-sky)',
                }}
              >
                <span
                  className="text-8xl font-bold opacity-90"
                  style={{ color: 'var(--md-white)' }}
                >
                  {name[0]}
                </span>
              </div>
            )}
          </motion.div>

          {/* 装饰性渐变 */}
          <div
            className="absolute -inset-4 opacity-30 blur-2xl -z-10"
            style={{
              background: reverse
                ? 'var(--md-gradient-primary)'
                : 'var(--md-gradient-sky)',
              borderRadius: 0,
            }}
          />
        </div>
      </ScrollReveal>

      {/* Content */}
      <ScrollReveal
        animation={reverse ? 'slideInLeft' : 'slideInRight'}
        className="flex-1"
      >
        <div>
          <div className="mb-8">
            <h2 className="text-h2 font-bold text-ink mb-4">
              {name}
            </h2>

            <p className="text-h3 text-sky mb-5" style={{ lineHeight: '1.4' }}>
              {tagline}
            </p>

            <p className="text-body text-slate mb-0" style={{ lineHeight: '1.7', fontSize: '17px' }}>
              {description}
            </p>
          </div>

          {/* Features */}
          <div className="mb-8">
            <h3 className="text-body font-bold text-ink mb-5">
              核心功能：
            </h3>

            {features.map((feature, index) => (
              <div
                key={index}
                style={{ marginBottom: index < features.length - 1 ? 'var(--space-5)' : 0 }}
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex p-5 transition-all duration-200 hover:translate-x-2 gap-4"
                  style={{ backgroundColor: 'var(--md-fog)', borderRadius: 0, border: '2px solid var(--md-graphite)' }}
                >
                  <span className="text-3xl">{feature.icon}</span>
                  <div className="flex-1">
                    <h4 className="text-body font-bold text-ink mb-3">
                      {feature.title}
                    </h4>
                    <p className="text-body text-slate mb-0" style={{ lineHeight: '1.6' }}>
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-8">
            <a
              href={href || getUrl(`tools/${id}`)}
              className="md-btn md-btn-secondary inline-flex"
            >
              <span>深入了解</span>
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
