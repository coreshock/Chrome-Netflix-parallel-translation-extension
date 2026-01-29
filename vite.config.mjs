import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            input: {
                popup: resolve(__dirname, 'index.html'),
                content: resolve(__dirname, 'src/content/index.tsx'),
                background: resolve(__dirname, 'src/background/index.ts'),
            },
            output: {
                entryFileNames: '[name].js',
                chunkFileNames: 'assets/[name].[hash].js',
                assetFileNames: 'assets/[name].[ext]',
            }
        }
    }
})
