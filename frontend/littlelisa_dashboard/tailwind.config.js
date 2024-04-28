/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        robotoMono: ['Roboto Mono', "monospace"],
        // Add more custom font families as needed
      },
    },
    backgroundImage:{
      'main-cam': "url('http://10.0.0.249/camStream')"
    },
  },
  plugins: [],
};
