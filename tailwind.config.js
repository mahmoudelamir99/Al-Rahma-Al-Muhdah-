/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // درجات الأزرق الأساسية (ثقة واحترافية)
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        // الأخضر الرسمي لواتساب
        whatsapp: {
          DEFAULT: "#25D366",
          dark: "#128C7E",
          darker: "#075E54",
        },
      },
      fontFamily: {
        sans: ["var(--font-cairo)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translate3d(0, 22px, 0)" },
          "100%": { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -10px, 0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "float-slow": "float-slow 6s ease-in-out infinite",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
