/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          sidebar: '#222A36',
          sidebarActive: '#3B4553',
          submenuActive: '#173A52',
          header: '#222A36',
          headerSearch: '#2A3442',
          bg: '#F4F6F9',
          card: '#FFFFFF',
          border: '#E2E8F0',
          inputBorder: '#CBD5E1',
          blue: '#1677FF',
          blueHover: '#0F6DE8',
          green: '#10B981',
          orange: '#F97316',
          red: '#EF4444',
          cyan: '#06B6D4',
          purple: '#7C3AED',
          slate: '#64748B',
          textMain: '#0E1726',
          textMuted: '#718096',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.05)',
        cardHover: '0 6px 20px rgba(15, 23, 42, 0.08)',
        dropdown: '0 10px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
        inputFocus: '0 0 0 3px rgba(22, 119, 255, 0.10)',
      },
      borderRadius: {
        card: '10px',
        btn: '8px',
        input: '8px',
      }
    },
  },
  plugins: [],
}
