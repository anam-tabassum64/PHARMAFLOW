/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: '#F8F7F2',
          light: '#FCFBF8',
          dark: '#F3F1E8',
        },
        cream: {
          DEFAULT: '#F1F0E9',
          light: '#F5F4EE',
          dark: '#E9E7DC',
        },
        forest: {
          50: '#F0F5F2',
          100: '#E2ECE7',
          200: '#C5D9D0',
          300: '#9DBEB3',
          400: '#6FA091',
          500: '#468371',
          600: '#2A6655',
          700: '#183D32',
          800: '#123027',
          900: '#0C201A',
          DEFAULT: '#183D32',
        },
        sage: {
          50: '#F3F6F2',
          100: '#E7EDE5',
          200: '#D5DFD1',
          300: '#BFCEBB',
          400: '#A8B8A2',
          500: '#8A9C83',
          600: '#6E7F67',
          DEFAULT: '#A8B8A2',
        },
        charcoal: {
          DEFAULT: '#252A27',
          soft: '#343B37',
          muted: '#4C544F',
        },
        secondary: {
          DEFAULT: '#777C76',
          muted: '#8D928C',
          light: '#A3A8A2',
        },
        subtle: {
          DEFAULT: '#E6E5DD',
          dark: '#D7D6CC',
          light: '#EDEDE6',
        },
      },
      fontFamily: {
        heading: ['Manrope', 'DM Sans', '-apple-system', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(37, 42, 39, 0.04), 0 1px 2px 0 rgba(37, 42, 39, 0.02)',
        card: '0 1px 3px 0 rgba(37, 42, 39, 0.05), 0 1px 2px -1px rgba(37, 42, 39, 0.03)',
        cardHover: '0 4px 12px -2px rgba(24, 61, 50, 0.08), 0 2px 6px -2px rgba(24, 61, 50, 0.04)',
        modal: '0 20px 30px -10px rgba(24, 61, 50, 0.12), 0 10px 15px -5px rgba(24, 61, 50, 0.06)',
      },
      borderRadius: {
        'editorial': '10px',
      },
    },
  },
  plugins: [],
}
