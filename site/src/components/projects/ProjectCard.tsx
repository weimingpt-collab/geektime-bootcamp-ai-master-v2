import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { getUrl, getImageUrl } from '../../utils/url';

interface ProjectCardProps {
  number: number;
  title: string;
  subtitle: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedHours: number;
  techStack: string[];
  href?: string;
  previewImage?: string;
}

export default function ProjectCard({
  number,
  title,
  subtitle,
  difficulty,
  estimatedHours,
  techStack,
  href,
  previewImage,
}: ProjectCardProps) {
  return (
    <motion.a
      href={href || getUrl(`projects/project-${number}`)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="block md-card md-card-interactive group"
    >
      {/* Preview Image */}
      <div
        className="overflow-hidden relative aspect-video mb-6"
        style={{
          background: 'linear-gradient(135deg, #6FC2FF 0%, #16AA98 100%)',
        }}
      >
        {previewImage ? (
          <div className="flex justify-center items-center p-6 w-full h-full">
            <img
              src={getImageUrl(previewImage)}
              alt={title}
              className="max-w-full max-h-full object-contain shadow-xl border-2 group-hover:scale-[1.02] transition-all duration-300"
              style={{
                borderColor: 'rgba(255, 255, 255, 0.2)',
                backgroundColor: 'var(--md-white)',
                borderRadius: 0,
              }}
            />
          </div>
        ) : (
          <div className="flex justify-center items-center w-full h-full">
            <span
              className="text-6xl font-bold opacity-30"
              style={{ color: 'var(--md-white)' }}
            >
              {number}
            </span>
          </div>
        )}

        {/* 项目徽章 */}
        <div className="absolute top-4 left-space-4 md-badge">
          项目 {number}
        </div>
      </div>

      {/* Content */}
      <div>
        <h3 className="font-bold transition-colors duration-200 text-h3 text-ink mb-3 group-hover:text-sky">
          {title}
        </h3>

        <p className="text-body text-slate mb-6" style={{ lineHeight: '1.6' }}>
          {subtitle}
        </p>

        {/* Meta Info */}
        <div className="flex flex-wrap text-ui text-slate gap-1 mb-6">
          <div className="flex items-center gap-1">
            <span>难度:</span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < difficulty ? 'fill-watermelon' : ''}
                  style={{
                    color: i < difficulty ? 'var(--md-watermelon)' : 'var(--md-slate)'
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span>⏱</span>
            <span>{estimatedHours} 小时</span>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-1 mb-6">
          {techStack.map((tech) => (
            <span key={tech} className="md-badge text-eyebrow">
              {tech}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center font-bold transition-all duration-200 text-ui text-sky gap-1 group-hover:gap-3">
          <span>查看详情</span>
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </motion.a>
  );
}
