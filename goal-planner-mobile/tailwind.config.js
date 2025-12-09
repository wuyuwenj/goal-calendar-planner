/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Trellis Primary Colors (Green)
        primary: {
          forest: '#2D5A3D',
          sage: '#6B8E6B',
          mint: '#A8D5A2',
          light: '#E8F5E8',
        },
        // Trellis Secondary Colors (Brown)
        secondary: {
          bark: '#5D4037',
          warm: '#8D6E63',
          sand: '#D7CCC8',
          cream: '#FAF8F5',
        },
        // System Colors
        error: '#D32F2F',
        'error-light': '#FFEBEE',
        warning: '#F9A825',
        'warning-light': '#FFF8E1',
        info: '#1976D2',
        'info-light': '#E3F2FD',
        // Neutral (mapped to brown tones)
        neutral: {
          50: '#FAF8F5',
          100: '#F5F0EB',
          200: '#E8E0D8',
          300: '#D7CCC8',
          400: '#A69B94',
          500: '#8D6E63',
          600: '#6D5B52',
          700: '#5D4037',
          800: '#3E2723',
          900: '#2D1F1A',
        },
        // Green shades
        green: {
          50: '#E8F5E8',
          100: '#C8E6C9',
          200: '#A8D5A2',
          300: '#81C784',
          400: '#6B8E6B',
          500: '#4CAF50',
          600: '#43A047',
          700: '#2D5A3D',
          800: '#1B5E20',
          900: '#1A3A24',
        },
        // Red shades
        red: {
          50: '#FFEBEE',
          100: '#FFCDD2',
          200: '#EF9A9A',
          500: '#F44336',
          700: '#D32F2F',
        },
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        'xxl': '48px',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
      },
      fontSize: {
        'h1': ['28px', { lineHeight: '36px', fontWeight: '700' }],
        'h2': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'h3': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
    },
  },
  plugins: [],
}
