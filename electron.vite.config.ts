import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        external: ['better-sqlite3', 'bcrypto']
        // input: {
        //   index: resolve(__dirname, 'src/main/index.ts'),
        //   monitoringStatus: resolve(__dirname, 'src/main/monitoring/status.ts')
        // }
      }
    }
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/index.ts')
        }
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react()],
    build: {
      commonjsOptions: { transformMixedEsModules: true },
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html'),
          update: resolve(__dirname, 'src/renderer/update.html')
        }
      }
    }
  }
})
