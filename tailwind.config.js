/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#f9f6f3',
          100: '#f0e6dc',
          200: '#e0ccb9',
          300: '#c9a580',
          400: '#b27c4b',
          500: '#9b5d2f',
          600: '#814923',
          700: '#68391d',
          800: '#562f1b',
          900: '#48291a',
        },
      },
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/line-clamp')],
}
