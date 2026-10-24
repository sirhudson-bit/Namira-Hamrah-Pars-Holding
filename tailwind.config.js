/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", '[data-theme="dark"]'],
  /**
   * Tailwind's own `container` caps itself at each breakpoint (max-width), which
   * is the opposite of the requested full-width layout. It is disabled here and
   * re-implemented as a fluid, gutter-only `.container` in globals.css.
   */
  corePlugins: {
    container: false,
  },
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    /**
     * One corner radius for every non-circular element. A mixed scale
     * (12/16/24/28) reads as inconsistent; pills stay fully round.
     */
    borderRadius: {
      none: "0px",
      sm: "16px",
      DEFAULT: "16px",
      md: "16px",
      lg: "16px",
      xl: "16px",
      "2xl": "16px",
      "3xl": "16px",
      full: "9999px",
      card: "16px",
      tile: "16px",
      btn: "16px",
    },
    extend: {
      fontFamily: {
        sans: ["Vazirmatn", "system-ui", "sans-serif"],
      },
      /**
       * Role-based tokens backed by CSS variables, so switching
       * `data-theme` on <html> re-skins the whole site at runtime with no
       * class changes. Values are `R G B` triplets (see globals.css):
       *   ink-*      → foreground text scale (900 strongest)
       *   surface-*  → background surfaces (50 = page canvas, DEFAULT = raised)
       *   line-200   → hairline borders / dividers (full colour value)
       *   accent     → the readable brand tint for the active theme
       *   dark-*     → full-bleed bands — deliberately dark in BOTH themes
       *   brand-*    → the logo teal, for solid fills
       */
      colors: {
        brand: {
          50: "#F0FAF8",
          100: "#DCF2EF",
          200: "#B8E6DF",
          300: "#6FD8CB",
          400: "#45C7B8",
          500: "#26B5A6",
          600: "#17998B",
          700: "#0F7C71",
          800: "#0B5F57",
          900: "#0A4B46",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          strong: "rgb(var(--accent-strong) / <alpha-value>)",
          soft: "rgb(var(--accent) / 0.14)",
        },
        ink: {
          900: "rgb(var(--ink-900) / <alpha-value>)",
          700: "rgb(var(--ink-700) / <alpha-value>)",
          500: "rgb(var(--ink-500) / <alpha-value>)",
          400: "rgb(var(--ink-400) / <alpha-value>)",
        },
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          50: "rgb(var(--surface-50) / <alpha-value>)",
          100: "rgb(var(--surface-100) / <alpha-value>)",
          200: "rgb(var(--surface-200) / <alpha-value>)",
        },
        line: {
          200: "var(--line-200)",
        },
        // Bands stay dark in both themes so the WebGL scenes and the hero
        // always read correctly; text inside them is kept light (see `.band`).
        dark: {
          900: "#070A09",
          800: "#0B0F0E",
          700: "#121A18",
        },
        logo: {
          gray: "#8FA39D",
        },
      },
      borderRadius: {
        card: "16px",
        tile: "16px",
        btn: "16px",
      },
      boxShadow: {
        /* Soft and diffused: wide blur, generous negative spread and a low
           alpha, layered so the edge never reads as a hard line. */
        soft: "0 40px 80px -48px rgba(0,0,0,0.35), 0 12px 32px -20px rgba(0,0,0,0.22), inset 0 1px 0 0 rgb(var(--ink-900) / 0.03)",
        lift: "0 60px 120px -60px rgba(0,0,0,0.42), 0 20px 48px -28px rgba(0,0,0,0.26), inset 0 1px 0 0 rgb(var(--ink-900) / 0.05)",
        glow: "0 0 0 1px rgb(var(--accent) / 0.12), 0 50px 100px -56px rgb(var(--accent) / 0.32)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "marquee-x": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "marquee-x-reverse": {
          from: { transform: "translateX(-50%)" },
          to: { transform: "translateX(0)" },
        },
        "soft-pulse": {
          "0%, 100%": { opacity: "0.35", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.06)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 400ms cubic-bezier(0.4, 0, 0.2, 1) both",
        "fade-in": "fade-in 300ms cubic-bezier(0.4, 0, 0.2, 1) both",
        "marquee-x": "marquee-x 40s linear infinite",
        "marquee-x-reverse": "marquee-x-reverse 40s linear infinite",
        "soft-pulse": "soft-pulse 6s ease-in-out infinite",
        shimmer: "shimmer 6s linear infinite",
      },
    },
  },
  plugins: [],
};
