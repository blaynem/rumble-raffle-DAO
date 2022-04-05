module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  mode: 'jit',
  darkMode: 'class', // or 'media' or 'class'
  important: true,
  theme: {
    extend: {
      colors: {
        rumbleBgLight: '#F8F8F8',
        rumbleBgDark: '#222222',
        rumblePrimary: '#9912B8',
        rumbleSecondary: '#4CE3B6',
        rumbleTertiary: '#FDFC00',
        rumbleOutline: '#000000',
        rumbleNone: '#FFFFFF',
      },
    },
  },
  variants: {
    extend: {
      scrollbar: ['dark']
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwind-scrollbar')
  ],
  safelist: [
    'whitelisted',
    {
      pattern: /bg-(red|green|blue|yellow)-(400|500|600)/,
    },
  ]
}