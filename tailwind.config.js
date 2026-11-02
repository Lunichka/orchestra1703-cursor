/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.jsx', './index.html', './404.html'],
  // классы кнопок собираются в коде динамически ('btn-' + variant), поэтому перечислены явно
  safelist: ['btn-paper', 'btn-green', 'btn-mustard', 'btn-sm', 'btn-lg', 'btn-block'],
  theme: {
    extend: {
      colors: {
        green: '#143127',
        coral: '#ff5757',
        mustard: '#ffba55',
        cream: '#efe3da',
        paper: '#fffae7',
      },
      fontFamily: {
        display: ['"Despair Display"', '"Arial Black"', 'Arial', 'sans-serif'],
        deco: ['DRUZHOK', 'Georgia', 'serif'],
        sans: ['Steppe', 'Arial', 'sans-serif'],
      },
      borderWidth: { 3: '3px', 4: '4px' },
      borderRadius: { card: '26px' },
    },
  },
  plugins: [],
};
