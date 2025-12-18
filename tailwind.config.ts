import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy backward compatibility
        background: "var(--background)",
        foreground: "var(--foreground)",

        // Theme system colors
        theme: {
          page: {
            bg: "var(--theme-page-bg)",
            text: "var(--theme-page-text)",
          },
          calendar: {
            bg: "var(--theme-calendar-bg)",
            text: "var(--theme-calendar-text)",
            border: "var(--theme-calendar-grid-border)",
            today: "var(--theme-calendar-today)",
            event: "var(--theme-calendar-event)",
          },
          weather: {
            bg: "var(--theme-weather-bg)",
            text: "var(--theme-weather-text)",
            accent: "var(--theme-weather-accent)",
          },
          metar: {
            bg: "var(--theme-metar-bg)",
            text: "var(--theme-metar-text)",
            accent: "var(--theme-metar-accent)",
          },
          photos: {
            bg: "var(--theme-photos-bg)",
            text: "var(--theme-photos-text)",
            border: "var(--theme-photos-border)",
          },
        },
      },
      backdropBlur: {
        theme: "var(--theme-backdrop-blur)",
      },
      borderRadius: {
        theme: "var(--theme-border-radius)",
      },
      opacity: {
        theme: "var(--theme-widget-opacity)",
      },
    },
  },
  plugins: [],
};
export default config;
