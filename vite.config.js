const { defineConfig } = require('vite')
const react = require('@vitejs/plugin-react')
const { resolve } = require('path')

module.exports = defineConfig({
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
