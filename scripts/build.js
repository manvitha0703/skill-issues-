import { build } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

async function runBuild() {
  console.log('🚀 Building "Same Web, Different Eyes" Extension...');

  const root = path.resolve('.');
  const outDir = path.resolve('dist');

  // Clean dist
  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outDir, { recursive: true });

  // 1. Build HTML Entry points (Popup, Options, Onboarding, Demo)
  console.log('\n[1/3] Building HTML UI interfaces (Popup, Options, Onboarding, Demo)...');
  await build({
    root,
    base: '',
    plugins: [react()],
    build: {
      outDir,
      emptyOutDir: false,
      rollupOptions: {
        input: {
          popup: path.resolve('popup.html'),
          options: path.resolve('options.html'),
          onboarding: path.resolve('onboarding.html'),
          demo: path.resolve('demo.html'),
        },
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
    },
  });

  // 2. Build Content Script (IIFE for self-contained injection into arbitrary web pages)
  console.log('\n[2/3] Building Content Script...');
  await build({
    root,
    configFile: false,
    build: {
      outDir,
      emptyOutDir: false,
      lib: {
        entry: path.resolve('src/content/contentScript.ts'),
        name: 'SWDEContentScript',
        formats: ['iife'],
        fileName: () => 'contentScript.js',
      },
      rollupOptions: {
        output: {
          extend: true,
        },
      },
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
  });

  // 3. Build Background Service Worker (ES Module)
  console.log('\n[3/3] Building Background Service Worker...');
  await build({
    root,
    configFile: false,
    build: {
      outDir,
      emptyOutDir: false,
      lib: {
        entry: path.resolve('src/background/serviceWorker.ts'),
        formats: ['es'],
        fileName: () => 'serviceWorker.js',
      },
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
  });

  // 4. Copy manifest and icons if needed
  const manifestSrc = path.resolve('public/manifest.json');
  const manifestDest = path.resolve('dist/manifest.json');
  fs.copyFileSync(manifestSrc, manifestDest);

  // Copy icons
  const iconsSrcDir = path.resolve('public/icons');
  const iconsDestDir = path.resolve('dist/icons');
  if (fs.existsSync(iconsSrcDir)) {
    fs.mkdirSync(iconsDestDir, { recursive: true });
    fs.readdirSync(iconsSrcDir).forEach((file) => {
      fs.copyFileSync(path.join(iconsSrcDir, file), path.join(iconsDestDir, file));
    });
  }

  // 5. Verify Build Outputs
  const requiredFiles = [
    'manifest.json',
    'popup.html',
    'options.html',
    'onboarding.html',
    'demo.html',
    'contentScript.js',
    'serviceWorker.js',
    'icons/icon16.png',
    'icons/icon48.png',
    'icons/icon128.png',
  ];

  console.log('\n🔍 Verifying build integrity...');
  let allPresent = true;
  for (const rel of requiredFiles) {
    const fullPath = path.join(outDir, rel);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ Missing build artifact: ${rel}`);
      allPresent = false;
    } else {
      const stats = fs.statSync(fullPath);
      console.log(`  ✓ ${rel} (${stats.size} bytes)`);
    }
  }

  if (!allPresent) {
    throw new Error('Build verification failed: missing artifacts in dist/');
  }

  console.log('\n✨ Build complete! The extension is ready to load unpacked from the "dist" directory.');
}

runBuild().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
