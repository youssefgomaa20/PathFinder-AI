// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // مهم لتفعيل الوضع الليلي
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(210, 16%, 82%)",
        background: "hsl(0, 0%, 100%)",
        foreground: "hsl(210, 20%, 15%)",
        primary: "hsl(199, 89%, 48%)",
        "primary-foreground": "hsl(0, 0%, 100%)",
        secondary: "hsl(214, 32%, 91%)",
        "secondary-foreground": "hsl(222, 47%, 11%)",
        muted: "hsl(210, 40%, 96.1%)",
        "muted-foreground": "hsl(215.4, 16.3%, 46.9%)",
        accent: "hsl(199, 89%, 48%)",
        "accent-foreground": "hsl(222, 47%, 11%)",
        destructive: "hsl(0, 84.2%, 60.2%)",
        "destructive-foreground": "hsl(210, 40%, 98%)",
        card: "hsl(0, 0%, 100%)",
        "card-foreground": "hsl(222, 47%, 11%)",
        ring: "hsl(199, 89%, 48%)",
        animation: {
      'gradient-x': 'gradient-x 15s ease infinite',
    },
    keyframes: {
      'gradient-x': {
        '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
        '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
      },
    },
  
      }
    }
  },
  plugins: []
};