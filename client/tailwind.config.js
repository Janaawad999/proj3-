/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // AgriPulse: Living Intelligence Brand System
                agri: {
                    ivory: '#F6F5EF',          // Warm Ivory primary page background
                    ivorySoft: '#EFEFE7',      // Slightly deeper ivory for nested panels
                    forest: '#173F35',         // Forest Green primary brand
                    forestHover: '#13352D',    // Forest Green hover state
                    evergreen: '#102D27',      // Deep Evergreen high-contrast surface
                    lime: '#C7F36B',           // Fresh Lime active highlights & accents
                    limeHover: '#B5E655',      // Lime hover
                    sage: '#DCE7D8',           // Soft sage background & nominal state
                    sageSoft: '#EBF1E8',       // Ultra soft sage
                    graphite: '#252B28',       // High-contrast primary text
                    stone: '#858A80',          // Muted secondary stone text
                    amber: '#E7A944',          // Anomaly warnings
                    red: '#D94C45',            // Critical alarms / Cavitation
                },
                // Background tokens
                bg: {
                    page: '#F6F5EF',
                    surface: '#FFFFFF',
                    subtle: '#EFEFE7',
                    dark: '#102D27',
                    darkCard: '#143831',
                    darkHover: '#1C4B41',
                },
                // Typography tokens
                text: {
                    primary: '#252B28',
                    secondary: '#858A80',
                    brand: '#173F35',
                    inverse: '#F6F5EF',
                    lime: '#C7F36B',
                },
                // Precision borders
                border: {
                    subtle: '#E6E5DC',
                    DEFAULT: '#D8D7CD',
                    forest: '#173F35',
                    lime: '#C7F36B',
                },
                // Status tokens
                status: {
                    optimal: '#173F35',
                    healthy: '#2E7D32',
                    caution: '#E7A944',
                    critical: '#D94C45',
                    offline: '#858A80',
                },
            },
            borderRadius: {
                'sm': '4px',
                'DEFAULT': '6px',
                'md': '8px',
                'lg': '10px',
                'xl': '12px',
            },
            boxShadow: {
                'subtle': '0 1px 3px rgba(23, 63, 53, 0.04), 0 1px 2px rgba(23, 63, 53, 0.02)',
                'panel': '0 4px 14px rgba(23, 63, 53, 0.06)',
                'evergreen': '0 12px 30px rgba(16, 45, 39, 0.25)',
                'lime-glow': '0 0 16px rgba(199, 243, 107, 0.25)',
            },
            fontFamily: {
                sans: ['Manrope', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
            },
        },
    },
    plugins: [],
};
