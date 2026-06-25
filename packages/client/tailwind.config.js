/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6C5CE7',
          hover: '#7C6EF0',
          active: '#5A4BD6',
          light: '#A29BFE',
          bg: 'rgba(108, 92, 231, 0.08)',
          'bg-hover': 'rgba(108, 92, 231, 0.14)',
        },
        bg: {
          DEFAULT: '#0A0A0F',
          elevated: '#12121A',
          surface: '#1A1A26',
          'surface-hover': '#222233',
          overlay: 'rgba(10, 10, 15, 0.85)',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
          hover: 'rgba(255, 255, 255, 0.15)',
          strong: 'rgba(255, 255, 255, 0.2)',
        },
        text: {
          primary: '#F0F0F5',
          secondary: '#9B9BB0',
          tertiary: '#6B6B80',
          inverse: '#0A0A0F',
          accent: '#6C5CE7',
        },
        state: {
          success: '#00B894',
          warning: '#FDCB6E',
          error: '#E17055',
          info: '#74B9FF',
        },
        warm: {
          DEFAULT: '#E17055',
          light: '#FDCB6E',
        },
        cool: {
          DEFAULT: '#74B9FF',
        },
        teal: {
          DEFAULT: '#00CEC9',
          light: '#55EFC4',
        },
      },
      fontFamily: {
        display: ['Inter', 'Noto Sans SC', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['Inter', 'Noto Sans SC', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
      },
      lineHeight: {
        tight: '1.2',
        snug: '1.35',
        normal: '1.6',
        relaxed: '1.75',
      },
      letterSpacing: {
        tight: '-0.02em',
        normal: '0',
        wide: '0.02em',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
        md: '0 4px 12px rgba(0, 0, 0, 0.25)',
        lg: '0 8px 24px rgba(0, 0, 0, 0.3)',
        glow: '0 0 40px rgba(108, 92, 231, 0.15)',
        'glow-strong': '0 0 60px rgba(108, 92, 231, 0.25)',
        'glow-warm': '0 0 40px rgba(225, 112, 85, 0.12)',
        'glow-cool': '0 0 40px rgba(116, 185, 255, 0.12)',
        'glow-teal': '0 0 40px rgba(0, 206, 201, 0.12)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 50%, #74B9FF 100%)',
        'gradient-hero': 'linear-gradient(135deg, #6C5CE7 0%, #E17055 100%)',
        'gradient-warm': 'linear-gradient(135deg, #E17055 0%, #FDCB6E 100%)',
        'gradient-cool': 'linear-gradient(135deg, #00CEC9 0%, #6C5CE7 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(108, 92, 231, 0.06) 0%, rgba(0, 0, 0, 0) 100%)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '250ms',
        slow: '400ms',
      },
      animation: {
        'hero-glow': 'heroGlow 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        heroGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      zIndex: {
        'dropdown': '100',
        'sticky': '200',
        'overlay': '300',
        'modal': '400',
        'toast': '500',
      },
    },
  },
  plugins: [],
}
