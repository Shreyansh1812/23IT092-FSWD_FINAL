import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom']
    },
    resolve: {
        extensions: ['.js', '.jsx'],
    },
    esbuild: {
        loader: 'jsx',
        include: /\.(jsx|js)$/,
        exclude: [],
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
            }
        }
    }
});
