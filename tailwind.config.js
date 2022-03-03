const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // look here to add more colors later https://www.figma.com/file/8WjVJW9fa2rwGctm7ZVaCT/Design-System?node-id=1023%3A36350
      colors: {
        gray: {
          25: '#FEFEFE',
          50: '#F4F4F4',
          100: '#E0E0E0',
          200: '#C6C6C6',
          300: '#A8A8A8',
          400: '#8D8D8D',
          500: '#6F6F6F',
          600: '#525252',
          700: '#393939',
          800: '#262626',
          900: '#171717',
        },
        'hola-black': '#262626',
      },
      fontFamily: {
        sans: ['Inter ', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  extend: {},
  plugins: [require('@tailwindcss/forms')],
};
