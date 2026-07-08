/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#0A0E27', // Deep space black/blue background
        secondary: '#00FFFF', // Snake / Glow neon cyan
        accent: '#00FF00', // Scores / Accents lime green
        warning: '#FFFF00', // Alerts / Bonuses neon yellow
        destructive: '#FF0000', // Errors / Game Over solid red
        score: '#00FF00', // Leaderboard ranks
        qualified: '#00FFFF', // Qualifications
        reward: '#FFD700', // USDC rewards neon gold
        grey: {
          DEFAULT: '#808080', // Muted Grey
          100: '#C0C0C0', // Silver Grey
          200: '#404040', // Dark Charcoal
        },
      },
      fontFamily: {
        arcade: ['PressStart2P-Regular', 'monospace'],
        pixel: ['PixelifySans-Regular', 'monospace'],
        pixel_medium: ['PixelifySans-Medium', 'monospace'],
        pixel_semibold: ['PixelifySans-SemiBold', 'monospace'],
        pixel_bold: ['PixelifySans-Bold', 'monospace'],
        terminal: ['VT323-Regular', 'monospace'],
        poppins: ['Poppins-Regular', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
