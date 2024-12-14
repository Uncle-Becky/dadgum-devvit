import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');
  
  const isProduction = mode === 'production';
  
  return {
    plugins: [
      react(),
      tsconfigPaths(),
    ],
    
    server: {
      port: 3000,
      cors: true,
      hmr: {
        overlay: true,
      },
    },
    
    build: {
      sourcemap: !isProduction,
      minify: isProduction ? 'terser' : false,
      target: 'esnext',
      outDir: 'dist',
      rollupOptions: {
        input: {
          main: './src/main.tsx',
        },
        output: {
          manualChunks: {
            'vendor': ['react', 'react-dom'],
            'devvit': ['@devvit/public-api']
          }
        }
      },
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction
        }
      }
    },
    
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@webroot': resolve(__dirname, './webroot'),
        '@config': resolve(__dirname, './config')
      }
    },
    
    optimizeDeps: {
      include: ['react', 'react-dom']
    },
    
    define: {
      __DEV__: !isProduction,
      __STAGING__: mode === 'staging',
      __PROD__: isProduction,
      // Inject env variables
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.API_URL': JSON.stringify(env.API_URL),
      'process.env.DEBUG': JSON.stringify(env.DEBUG),
    },
    
    css: {
      devSourcemap: true,
      modules: {
        scopeBehavior: 'local',
        localsConvention: 'camelCase',
        generateScopedName: isProduction
          ? '[hash:base64:5]'
          : '[name]__[local]___[hash:base64:5]'
      }
    }
  };
});
