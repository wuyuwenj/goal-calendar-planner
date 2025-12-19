import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors (Green - Nature, Growth)
        forest: '#2D5A3D',
        sage: '#6B8E6B',
        mint: '#A8D5A2',
        'light-green': '#E8F5E8',
        // Secondary Colors (Brown - Earth, Stability)
        bark: '#5D4037',
        warm: '#8D6E63',
        sand: '#D7CCC8',
        cream: '#FAF8F5',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
