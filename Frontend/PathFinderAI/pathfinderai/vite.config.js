import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { mockupPreviewPlugin } from './src/plugins/mockupPreviewPlugin.js';
import path from 'path';
export default defineConfig({
    plugins: [
        react(),
        mockupPreviewPlugin(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    server: {
        port: 5173,
    },
    build: {
        target: 'es2023',
    },
});
