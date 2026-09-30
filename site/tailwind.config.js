import plugin from 'tailwindcss/plugin';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        cream: '#F4EFEA',
        sunbeam: {
          DEFAULT: '#FFDE00',
          dark: '#E3C300',
        },
        sky: {
          DEFAULT: '#6FC2FF',
          strong: '#2BA5FF',
        },
        garden: '#16AA98',
        softBlue: '#EBF9FF',
        cloud: '#FFFFFF',
        fog: '#F8F8F7',
        ink: '#383838',
        slate: '#A1A1A1',
        graphite: '#000000',
        grid: '#E4D6C3',
      },

      fontFamily: {
        md: [
          'Aeonik Mono',
          'Aeonik Fono',
          'Inter',
          '"Helvetica Neue"',
          'sans-serif',
        ],
        fono: [
          'Aeonik Fono',
          'Aeonik Mono',
          'Inter',
          '"Helvetica Neue"',
          'monospace',
        ],
      },

      fontSize: {
        hero: ['var(--font-hero)', { lineHeight: 'var(--line-height-hero)', letterSpacing: '0.08em' }],
        h2: ['var(--font-h2)', { lineHeight: '1.25', letterSpacing: '0.06em' }],
        h3: ['var(--font-h3)', { lineHeight: '1.3', letterSpacing: '0.04em' }],
        body: ['var(--font-body)', { lineHeight: 'var(--line-height-body)' }],
        ui: ['var(--font-ui)', { letterSpacing: '0.08em' }],
        eyebrow: ['var(--font-eyebrow)', { letterSpacing: '0.08em' }],
      },

      spacing: {
        'space-2': 'var(--space-2)',
        'space-3': 'var(--space-3)',
        'space-4': 'var(--space-4)',
        'space-5': 'var(--space-5)',
        'space-6': 'var(--space-6)',
        'space-7': 'var(--space-7)',
        'space-8': 'var(--space-8)',
        'space-9': 'var(--space-9)',
        'space-10': 'var(--space-10)',
        'space-11': 'var(--space-11)',
        'space-12': 'var(--space-12)',
        section: 'var(--space-section)',
      },

      borderRadius: {
        micro: '2px',
        none: '0',
      },

      boxShadow: {
        press: '0 7px 0 rgba(0, 0, 0, 1)',
      },

      maxWidth: {
        container: '1200px',
      },

      transitionDuration: {
        quick: '120ms',
        default: '240ms',
      },

      backgroundImage: {
        'md-hero': 'linear-gradient(135deg, rgba(255, 222, 0, 0.4) 0%, rgba(111, 194, 255, 0.25) 100%)',
      },
    },
  },
  plugins: [
    typography,
    plugin(function ({ addComponents }) {
      addComponents({
        '.md-cta-stack': {
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-6)',
          alignItems: 'center',
        },
        '.md-highlight-row': {
          display: 'grid',
          gap: 'var(--space-8)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        },
      });
    }),
  ],
};
