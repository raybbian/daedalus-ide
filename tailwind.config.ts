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
        'daedalus0': '#5d275d',
        'daedalus1': '#b13e53',
        'daedalus2': '#ef7d57',
        'daedalus3': '#ffcd75',
        'daedalus4': '#a7f070',
        'daedalus5': '#38b764',
        'daedalus6': '#257179',
        'daedalus7': '#29366f',
        'daedalus8': '#3b5dc9',
        'daedalus9': '#41a6f6',
        'daedalus10': '#73eff7',
        'daedalus11': '#f4f4f4',
        'daedalus12': '#94b0c2',
        'daedalus13': '#566c86',
        'daedalus14': '#333c57',
        'daedalus15': '#1a1c2c',
      }
    },
  },
  plugins: [],
};
export default config;
