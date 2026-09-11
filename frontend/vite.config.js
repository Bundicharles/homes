import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { existsSync, cpSync, writeFileSync, rmSync } from 'fs';

export default defineConfig(({ command, mode }) => {
  let resolvedBase = process.env.VITE_BASE_URL || (command === 'build' ? '/homes/' : '/');

  return {
    base: resolvedBase,
    plugins: [
      react(),
      {
        name: 'write-htaccess-and-sync-root',
        configResolved(config) {
          resolvedBase = config.base || '/';
        },
         closeBundle() {
          const isRootBase = resolvedBase === '/' || resolvedBase === '' || resolvedBase === './';
          const swScope = isRootBase ? '/' : resolvedBase;
          const htaccess = `
Options -Indexes

<IfModule mod_rewrite.c>
  RewriteEngine On

  # Do not rewrite existing files, directories, or backend routes
  RewriteRule ^backend(/.*)?$ - [L]
  RewriteRule ^dist(/.*)?$ - [L]

  # Return 404 for missing static assets (prevents SPA fallback from
  # serving index.html as a replacement, which would cause MIME errors)
  RewriteCond %{REQUEST_URI} \\.(?:js|mjs|css|json|webmanifest|svg|png|jpg|jpeg|webp|avif|ico|woff|woff2|ttf|eot|map|txt|xml)$ [NC]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteRule ^ - [R=404,L]

  # Serve existing files and directories directly
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  # SPA fallback for client-side routes
  RewriteRule ^ index.html [L]
</IfModule>

<IfModule mod_mime.c>
  AddType application/javascript .js .mjs
  AddType application/manifest+json .webmanifest
  AddType application/json .json
  AddType image/svg+xml .svg
  AddType image/webp .webp
  AddType font/woff2 .woff2
</IfModule>

<IfModule mod_headers.c>
  <Files "sw.js">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Service-Worker-Allowed "${swScope}"
  </Files>
  <Files "manifest.webmanifest">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
  </Files>
  <FilesMatch "\\.(js|mjs|css|woff2)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  # Permissions-Policy: override any parent .htaccess that still sends the
  # unsupported "attribution-reporting" directive (browser console warning).
  Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
</IfModule>
`;
          writeFileSync(path.resolve(__dirname, '../dist/.htaccess'), htaccess.trim() + '\n');
          console.log(`Wrote dist/.htaccess for base "${swScope}" with PWA headers`);

          // Sync build artifacts to root folder so index.html and assets live in root
          const distDir = path.resolve(__dirname, '../dist');
                    const rootDir = path.resolve(__dirname, '..');

          // Clean stale build artifacts in the root deployment folder so old
          // hashed asset chunks are not left behind after a rebuild. This
          // prevents mixed old/new hashes (the cause of production 404 cascades).
          const staleAssetsRoot = path.join(rootDir, 'assets');
          if (existsSync(staleAssetsRoot)) {
            rmSync(staleAssetsRoot, { recursive: true, force: true });
          }
          const staleIndex = path.join(rootDir, 'index.html');
          if (existsSync(staleIndex)) {
            rmSync(staleIndex, { force: true });
          }

          // Copy root index.php into dist/ so it is part of the build output
          const rootIndexPhp = path.join(rootDir, 'index.php');
          if (existsSync(rootIndexPhp)) {
            cpSync(rootIndexPhp, path.join(distDir, 'index.php'), { force: true });
          }

          const filesToCopy = [
            'index.html',
            'assets',
            'index.php',
            'favicon.svg',
            'favicon-16x16.png',
            'favicon-32x32.png',
            'apple-touch-icon.png',
            'logo.svg',
            'logo-white.svg',
            'manifest.webmanifest',
            'offline.html',
            'pwa-192x192.png',
            'pwa-512x512.png',
            'pwa-maskable-512x512.png',
            'sw.js',
          ];
          for (const item of filesToCopy) {
            const src = path.join(distDir, item);
            const dst = path.join(rootDir, item);
            if (existsSync(src)) {
              cpSync(src, dst, { recursive: true, force: true });
            }
          }
          console.log('Successfully synced build artifacts to root folder');
        },
      },
    ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/admin': path.resolve(__dirname, './src/pages/admin'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/context': path.resolve(__dirname, './src/context'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/layouts': path.resolve(__dirname, './src/layouts'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:80/homes/backend/api',
        changeOrigin: true,
        secure: false,
      },
      // Local XAMPP layout — serves API + uploaded files directly from Apache
      '/homes/backend': {
        target: 'http://localhost:80',
        changeOrigin: true,
        secure: false,
      },
      // Hosting-layout-agnostic path (TrueHost style) rewritten to XAMPP layout
      '/backend': {
        target: 'http://localhost:80',
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/backend/, '/homes/backend'),
      },
    },
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'icons': ['lucide-react'],
          'query': ['@tanstack/react-query'],
          'axios': ['axios'],
          'form': ['react-hook-form'],
        },
      },
    },
    cssCodeSplit: true,
    sourcemap: true,
  },
  };
});
