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
        coy: {
          pink: "#FF4D8D",
          hoverPink: "#E03875",
          ink: "#1A1A1A",
          muted: "#666666",
          lightMuted: "#8E8E93",
          bgOuter: "#F3EFE9",
          canvas: "#FAF8F5",
          card: "#FFFFFF",
          border: "#1A1A1A",
          pastelPink: "#FFE4EC",
          pastelYellow: "#FEF08A",
          pastelMint: "#D1FAE5",
          pastelLavender: "#F3E8FF",
          pastelSky: "#E0F2FE",
        },
      },
      boxShadow: {
        brutal: "3px 3px 0px #1A1A1A",
        "brutal-lg": "4px 4px 0px #1A1A1A",
        "brutal-xl": "6px 6px 0px #1A1A1A",
        "brutal-sm": "2px 2px 0px #1A1A1A",
        "brutal-active": "1px 1px 0px #1A1A1A",
      },
      borderRadius: {
        brutal: "16px",
      },
    },
  },
  plugins: [],
};
export default config;
