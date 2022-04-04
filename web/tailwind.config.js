module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  mode: 'jit',
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    colors: {
      rumbleBgLight: '#F8F8F8',
      rumbleBgDark: '#222222',
      rumblePrimary: '#9912B8',
      rumbleSecondary: '#4CE3B6',
      rumbleTertiary: '#FDFC00',
      rumbleOutline: '#000000',
      rumbleNone: '#FFFFFF',
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
  safelist: [
    'whitelisted',
    {
      pattern: /bg-(red|green|blue)-(400|500|600)/,
    },
  ]
}