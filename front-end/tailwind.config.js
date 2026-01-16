/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: "#36e27b",
                "background-light": "#f6f8f7",
                "background-dark": "#112217",
                "text-main": "#111714",
                "text-sub": "#648772",
            },
            fontFamily: {
                display: ["Spline Sans", "sans-serif"]
            },
            borderRadius: {
                DEFAULT: "1rem",
                lg: "2rem",
                xl: "3rem",
                full: "9999px"
            }
        },
    },
    plugins: [],
}
