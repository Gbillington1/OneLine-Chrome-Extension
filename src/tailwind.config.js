/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./html/**/*.html", "./js/pdf/**/*.js", "./js/popup/**/*.js"],
  theme: {
    extend: {
      zIndex: {
        "max": "2147483647",
      },
    },
  },
  plugins: [],
}
