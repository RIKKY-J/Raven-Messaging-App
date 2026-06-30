import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#00a884",
          "primary-content": "#ffffff",
          "secondary": "#ece5dd",
          "accent": "#53bdeb",
          "neutral": "#222e35",
          "base-100": "#ffffff",
          "base-200": "#f0f2f5",
          "base-300": "#e9edef",
          "base-content": "#111b21",
        },
        dark: {
          "primary": "#2c6bed",
          "primary-content": "#ffffff",
          "secondary": "#202124",
          "accent": "#3b82f6",
          "neutral": "#2a2b2e",
          "base-100": "#121214",
          "base-200": "#1c1c1e",
          "base-300": "#2c2c2e",
          "base-content": "#f3f4f6",
        },
      },
    ],
  },
};
