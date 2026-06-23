module.exports = {
  content: {
    files: [
      './index.html',
      './src/**/*.{js,ts,jsx,tsx,html,css}'
    ],
    safelist: [
      { pattern: /bg-.*/ },
      { pattern: /text-.*/ },
      'px-3', 'py-2', 'rounded', 'cursor-not-allowed'
    ],
  },
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'Space Grotesk', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        'bg-grad-start': '#f8fbff',
        'bg-grad-end': '#eef5fb',
        primary: {
          DEFAULT: '#0ea5a4',
          600: '#0891b2',
        },
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
        },
      },
      borderRadius: {
        xl: '1rem',
      },
    },
  },
  plugins: [],
}
