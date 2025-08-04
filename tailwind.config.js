/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        // Mobile first approach
        'xs': '375px',      // Small mobile (iPhone SE)
        'sm': '640px',      // Large mobile (default Tailwind)
        'md': '768px',      // Tablet portrait (iPad Mini)
        'lg': '1024px',     // Tablet landscape / Small desktop
        'xl': '1280px',     // Desktop (default Tailwind)
        '2xl': '1536px',    // Large desktop (default Tailwind)
        '3xl': '1920px',    // Full HD desktop
        // Device-specific breakpoints
        'mobile': {'max': '767px'},           // Mobile only
        'tablet': {'min': '768px', 'max': '1023px'}, // Tablet only
        'desktop': {'min': '1024px'},         // Desktop and up
        'touch': {'raw': '(hover: none)'},    // Touch devices
        'hover': {'raw': '(hover: hover)'},   // Devices with hover
      },
      spacing: {
        // Responsive spacing scale
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      fontSize: {
        // Responsive typography scale
        'responsive-xs': 'clamp(0.75rem, 2vw, 0.875rem)',
        'responsive-sm': 'clamp(0.875rem, 2.5vw, 1rem)',
        'responsive-base': 'clamp(1rem, 3vw, 1.125rem)',
        'responsive-lg': 'clamp(1.125rem, 3.5vw, 1.25rem)',
        'responsive-xl': 'clamp(1.25rem, 4vw, 1.5rem)',
        'responsive-2xl': 'clamp(1.5rem, 5vw, 2rem)',
        'responsive-3xl': 'clamp(2rem, 6vw, 3rem)',
        'responsive-4xl': 'clamp(2.5rem, 7vw, 4rem)',
      },
      colors: {
        // Neutral color system
        neutral: {
          50: '#FAFAF9',   // Background
          100: '#F5F5F4',  // Card background
          200: '#E7E5E4',  // Borders
          300: '#D6D3D1',  // Inactive elements
          400: '#A8A29E',  // Muted text
          500: '#78716C',  // Secondary text
          600: '#57534E',  // Primary text
          700: '#44403C',  // Emphasis text
          800: '#292524',  // Strong text
          900: '#1C1917',  // Headings
        },
        // Coffee theme color system
        'coffee': {
          DEFAULT: '#8B4513', // coffee brown
          50: '#FAF7F2',   // cream
          100: '#F5E6D3',  // light latte
          200: '#E8D5BE',  // latte
          300: '#D4B896',  // medium latte
          400: '#B8956A',  // cappuccino
          500: '#8B4513',  // coffee brown
          600: '#6D3410',  // dark roast
          700: '#4A240B',  // espresso
          800: '#3C1D09',  // dark espresso
          900: '#2D1507',  // darkest
        },
        // Keep accent-warm as alias for backwards compatibility
        'accent-warm': {
          DEFAULT: '#8B4513',
          50: '#FAF7F2',
          100: '#F5E6D3',
          200: '#E8D5BE',
          300: '#D4B896',
          400: '#B8956A',
          500: '#8B4513',
          600: '#6D3410',
          700: '#4A240B',
          800: '#3C1D09',
          900: '#2D1507',
        },
        // 테마 대응 색상 시스템
        background: {
          DEFAULT: 'rgb(var(--color-background) / <alpha-value>)',
          secondary: 'rgb(var(--color-background-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--color-background-tertiary) / <alpha-value>)',
        },
        foreground: {
          DEFAULT: 'rgb(var(--color-foreground) / <alpha-value>)',
          secondary: 'rgb(var(--color-foreground-secondary) / <alpha-value>)',
          muted: 'rgb(var(--color-foreground-muted) / <alpha-value>)',
        },
        border: {
          DEFAULT: 'rgb(var(--color-border) / <alpha-value>)',
          secondary: 'rgb(var(--color-border-secondary) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          hover: 'rgb(var(--color-primary-hover) / <alpha-value>)',
          foreground: 'rgb(var(--color-primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--color-secondary) / <alpha-value>)',
          hover: 'rgb(var(--color-secondary-hover) / <alpha-value>)',
          foreground: 'rgb(var(--color-secondary-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          hover: 'rgb(var(--color-accent-hover) / <alpha-value>)',
          foreground: 'rgb(var(--color-accent-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'rgb(var(--color-destructive) / <alpha-value>)',
          hover: 'rgb(var(--color-destructive-hover) / <alpha-value>)',
          foreground: 'rgb(var(--color-destructive-foreground) / <alpha-value>)',
        },
        success: {
          DEFAULT: 'rgb(var(--color-success) / <alpha-value>)',
          hover: 'rgb(var(--color-success-hover) / <alpha-value>)',
          foreground: 'rgb(var(--color-success-foreground) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'rgb(var(--color-warning) / <alpha-value>)',
          hover: 'rgb(var(--color-warning-hover) / <alpha-value>)',
          foreground: 'rgb(var(--color-warning-foreground) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', 'system-ui', 'sans-serif'],
      },
      animation: {
        'theme-transition': 'theme-transition 0.3s ease-in-out',
        'shine': 'shine 1s ease-in-out',
      },
      keyframes: {
        'theme-transition': {
          '0%': { opacity: '0.8' },
          '100%': { opacity: '1' },
        },
        'shine': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
}
