/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/html/**/*.html", "./src/js/pdf/**/*.js", "./src/js/popup/**/*.js"],
  prefix: "ole-",
  theme: {
    extend: {
      colors: {
        "ol-darkgray": "#485056",
        "ol-green": "#25C998",
        "ol-green-dark": "#159972",
        "ol-offwhite": "#f6f4f7",
      },
      zIndex: {
        "max": "2147483647",
      },
      boxShadow: {
        'custom': '5px 5px 20px 5px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
}
