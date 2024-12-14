/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./webroot/**/*.{js,jsx,ts,tsx,html}"
  ],
  theme: {
    extend: {
      colors: {
        'reddit-orange': '#FF4500',
        'reddit-blue': '#0079D3',
        'reddit-gray': {
          100: '#F8F9FA',
          200: '#DAE0E6',
          300: '#A8ADB3',
          400: '#878A8C',
          500: '#1A1A1B'
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' }
        }
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(20px)'
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      zIndex: {
        'behind': '-1',
        'overlay': '100',
        'modal': '200',
        'tooltip': '300',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('tailwindcss-3d'),
    // Custom plugin for 3D transforms
    function({ addUtilities }) {
      const newUtilities = {
        '.transform-3d': {
          transform: 'perspective(1000px) rotateX(0) rotateY(0)',
          transformStyle: 'preserve-3d',
        },
        '.backface-visible': {
          backfaceVisibility: 'visible',
        },
        '.backface-hidden': {
          backfaceVisibility: 'hidden',
        }
      };
      addUtilities(newUtilities);
    }
  ],
}
