/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./assets/*.{html}'],
  theme: {
    screens: {
      'sm': '375px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    colors: {
      'bg-color': '#FCFCFC',
      'primary-color': '#4756DF',
      'secondary-color': '#FF7235',
      'primary-shadow': '#8B8EAF',
      'secondary-shadow': '#A17A69',
      'light-0': '#f8f9fa',
      'light-1': '#e9ecef',
      'light-2': '#dee2e6',
      'dark-0': '#495057',
      'dark-1': '#343a40',
      'dark-2': '#212529'
    },
    extend: {},
  },
  plugins: [],
}
