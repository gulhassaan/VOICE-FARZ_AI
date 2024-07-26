/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        bounceIn: {
          '0%, 20%, 40%, 60%, 80%, 100%': {
            animationTimingFunction: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
          },
          '0%': {
            opacity: '0',
            transform: 'scale3d(0.3, 0.3, 0.3)',
          },
          '20%': {
            transform: 'scale3d(1.1, 1.1, 1.1)',
          },
          '40%': {
            transform: 'scale3d(0.9, 0.9, 0.9)',
          },
          '60%': {
            opacity: '1',
            transform: 'scale3d(1.03, 1.03, 1.03)',
          },
          '80%': {
            transform: 'scale3d(0.97, 0.97, 0.97)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale3d(1, 1, 1)',
          },
        },
        bounceOut: {
          '20%': {
            transform: 'scale3d(0.9, 0.9, 0.9)',
          },
          '50%, 55%': {
            opacity: '1',
            transform: 'scale3d(1.1, 1.1, 1.1)',
          },
          '100%': {
            opacity: '0',
            transform: 'scale3d(0.3, 0.3, 0.3)',
          },
        },
        zoomIn: {
          '0%': {
            opacity: '0',
            transform: 'scale3d(0.3, 0.3, 0.3)',
          },
          '50%': {
            opacity: '1',
          },
        },
        zoomOut: {
          '0%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0',
            transform: 'scale3d(0.3, 0.3, 0.3)',
          },
          '100%': {
            opacity: '0',
          },
        },
        flash: {
          '0%, 50%, 100%': {
            opacity: '1',
          },
          '25%, 75%': {
            opacity: '0',
          },
        },
        pulse: {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.5',
          },
        },
        rubberBand: {
          '0%, 100%': {
            transform: 'scale3d(1, 1, 1)',
          },
          '30%': {
            transform: 'scale3d(1.25, 0.75, 1)',
          },
          '40%': {
            transform: 'scale3d(0.75, 1.25, 1)',
          },
          '50%': {
            transform: 'scale3d(1.15, 0.85, 1)',
          },
          '65%': {
            transform: 'scale3d(0.95, 1.05, 1)',
          },
          '75%': {
            transform: 'scale3d(1.05, 0.95, 1)',
          },
        },
        tada: {
          '0%': {
            transform: 'scale3d(1, 1, 1)',
          },
          '10%, 20%': {
            transform: 'scale3d(0.9, 0.9, 0.9) rotate3d(0, 0, 1, -3deg)',
          },
          '30%, 50%, 70%, 90%': {
            transform: 'scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg)',
          },
          '40%, 60%, 80%': {
            transform: 'scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg)',
          },
          '100%': {
            transform: 'scale3d(1, 1, 1)',
          },
        },
      },
      animation: {
        spin: 'spin 1s linear infinite',
        slideInRight: 'slideInRight 0.5s ease-out',
        slideInLeft: 'slideInLeft 0.5s ease-out',
        slideInUp: 'slideInUp 0.5s ease-out',
        slideInDown: 'slideInDown 0.5s ease-out',
        fadeIn: 'fadeIn 0.5s ease-in-out',
        fadeOut: 'fadeOut 0.5s ease-in-out',
        bounceIn: 'bounceIn 0.75s ease-in-out',
        bounceOut: 'bounceOut 0.75s ease-in-out',
        zoomIn: 'zoomIn 0.5s ease-in-out',
        zoomOut: 'zoomOut 0.5s ease-in-out',
        flash: 'flash 1s infinite',
        pulse: 'pulse 2s infinite',
        rubberBand: 'rubberBand 1s ease-in-out',
        tada: 'tada 1s ease-in-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
