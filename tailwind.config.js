/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E2A38',
        accent: '#3D9DF6',
        success: '#22C55E',
        warning: '#FACC15',
        error: '#EF4444',
        background: '#F9FAFB',
        surface: '#FFFFFF',
        text: '#334155',
        subtext: '#64748B',
      },
    },
  },
  plugins: [],
}
