/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,ts,js}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: 'var(--color-primary)', light: 'var(--color-primary-light)' },
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        text: { DEFAULT: 'var(--color-text)', secondary: 'var(--color-text-secondary)' },
        border: 'var(--color-border)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
      },
      spacing: {
        xs: 'var(--space-xs)', sm: 'var(--space-sm)',
        md: 'var(--space-md)', lg: 'var(--space-lg)', xl: 'var(--space-xl)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)', md: 'var(--radius-md)', lg: 'var(--radius-lg)',
      },
    },
  },
  plugins: [],
};
