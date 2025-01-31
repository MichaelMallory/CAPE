import { type Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    // ... existing theme config ...
  },
  plugins: [
    require("@tailwindcss/typography"),
    // ... other plugins ...
  ],
} satisfies Config 