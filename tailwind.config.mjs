/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Premium 2026: light neutrals, soft grays, muted wood, restrained teal
        white: '#F9F6F0',
        surface: {
          DEFAULT: '#F9F6F0',
          muted: '#EFEBE4',
          elevated: '#FCFBF8',
        },
        neutral: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
        wood: {
          light: '#E7DFD8',
          DEFAULT: '#C4B5A8',
          muted: '#A89F94',
        },
        accent: {
          DEFAULT: '#0D9488',
          light: '#14B8A6',
          muted: '#5EEAD4',
          dark: '#0F766E',
        },
        // Brand: #E85A07 (icon, CTA, accents)
        'brand-orange': '#E85A07',
        'brand-dark': '#262626',
        'brand-wood': '#4a3728',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Oswald', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'sharp': '0',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
