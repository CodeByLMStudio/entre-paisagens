import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Identidade visual rústico-urbana
        paper: '#F9EED8',
        paper2: '#F2E3C8',
        cream: '#F5EAD4',
        ink: '#42422A',
        inkDark: '#3E422A',
        inkMuted: '#70563D',
        clay: '#A36437',
        clayDark: '#9A461F',
        moss: '#646746',
        mossDark: '#525537',
        sand: '#DDBD8C',
      },
      fontFamily: {
        sans: ['var(--font-lato)', 'system-ui', 'sans-serif'],
        display: ['var(--font-montserrat)', 'var(--font-lato)', 'sans-serif'],
        alt: ['var(--font-manrope)', 'var(--font-lato)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
