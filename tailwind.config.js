/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nyano Brand Color Palette
        nyano: {
          cream: '#F5F1ED',         // Cream Canvas - Main background
          terracotta: '#D9734E',    // Terracotta - Primary/Action color
          forest: '#3E5954',        // Forest Green - Secondary
          brown: '#4A403A',         // Earthy Brown - Text/Headings
          marigold: '#F2B705',      // Marigold - Accent/Highlight
          'brown-light': '#8C7F79', // Muted text
          'brown-border': '#D1C7BF', // Borders & dividers
          'terracotta-dark': '#C06141', // Hover state
        },
        // Keep organic colors for backward compatibility
        organic: {
          background: '#F5F1ED',    // Map to cream
          primary: '#D9734E',       // Map to terracotta
          text: '#4A403A',          // Map to brown
          highlight: '#3E5954',     // Map to forest
          white: '#FFFFFF',         // Pure white
        },
        // Status colors maintaining organic feel
        status: {
          success: '#3E5954',       // Using forest green
          warning: '#F2B705',       // Using marigold
          error: '#C53030',         // Muted red
          info: '#4A90A4'           // Soft blue-grey
        }
      },
      fontFamily: {
        'display': ['Playfair Display', 'Lora', 'serif'],
        'brand': ['Playfair Display', 'serif'],
        'elegant': ['Cormorant Garamond', 'serif'],
        'classic': ['Libre Baskerville', 'serif'],
        'body': ['Nunito Sans', 'sans-serif'],
        'cultural': ['Noto Sans Devanagari', 'sans-serif']
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, rgba(185, 125, 75, 0.9) 0%, rgba(94, 140, 49, 0.9) 100%)',
        'mountain-pattern': "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23f8fffe\" fill-opacity=\"0.1\"%3E%3Cpath d=\"M30 30l15-15v30l-15-15zm-15 0l15 15v-30l-15 15z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0px)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
};