import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#FAFAF8",
          secondary: "#F5F4F0",
          tertiary: "#EFEDE7",
          card: "#FFFFFF",
        },
        ink: {
          primary: "#2C2C2A",
          secondary: "#5F5E5A",
          tertiary: "#888780",
          hint: "#B4B2A9",
        },
        moss: {
          50: "#F0F7F3",
          100: "#D7EBDE",
          200: "#AFD7C0",
          300: "#7FBC9A",
          400: "#4F9F73",
          500: "#2D8354",
          600: "#1F6640",
          700: "#185234",
          800: "#133F28",
          900: "#0D2E1E",
        },
        amber: {
          50: "#FAF6ED",
          100: "#F3E9CC",
          200: "#E8D49C",
          300: "#DCBE6B",
          400: "#D1A940",
          500: "#BE9229",
          600: "#9A7420",
          700: "#73591B",
          800: "#4D3C14",
          900: "#2E2410",
        },
        coral: {
          50: "#FDF2EF",
          100: "#FADDD4",
          200: "#F5B8A8",
          300: "#EE8D75",
          400: "#E56C50",
          500: "#D85230",
          600: "#B53E22",
          700: "#8E3019",
          800: "#682413",
          900: "#421810",
        },
        blue: {
          50: "#EEF5FC",
          100: "#D5E6F7",
          200: "#AECFEE",
          300: "#7EB3E2",
          400: "#4F96D4",
          500: "#2E7CBF",
          600: "#2264A0",
          700: "#1A4E7E",
          800: "#13395C",
          900: "#0D2538",
        },
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "sans-serif"],
        mono: ["SF Mono", "Fira Code", "Consolas", "monospace"],
      },
      fontSize: {
        "2xs": ["11px", "16px"],
        xs: ["12px", "18px"],
        sm: ["13px", "20px"],
        base: ["14px", "22px"],
        lg: ["15px", "24px"],
        xl: ["18px", "28px"],
        "2xl": ["22px", "32px"],
        "3xl": ["28px", "40px"],
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.03)",
        modal: "0 12px 32px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
