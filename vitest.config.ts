import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: [
        'src/components/StatusBadge.vue',
        'src/components/KpiCard.vue',
        'src/components/MetricCard.vue',
        'src/components/AppointmentInfoCard.vue',
        'src/stores/**/*.ts',
        'src/api/types.ts',
        'src/api/mock/data.ts',
        'src/pages/auth/**/*.vue',
      ],
      exclude: ['src/test/**', 'src/**/*.d.ts'],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 75,
        lines: 80,
      },
    },
  },
})
