/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/html/**/*.html", "./src/js/pdf/**/*.js", "./src/js/popup/**/*.js"],
  theme: {
    extend: {
      zIndex: {
        "max": "2147483647",
      },
    },
  },
  plugins: [],
}
