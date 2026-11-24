import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

function packageExtension() {
  console.log('📦 Packaging extension into ZIP file...');

  const distDir = path.resolve('dist');
  const zipPath = path.resolve('same-web-different-eyes.zip');

  if (!fs.existsSync(distDir)) {
    throw new Error('dist/ directory does not exist. Run npm run build first.');
  }

  // Remove existing zip if present
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }

  try {
    // Use .NET ZipFile directly with SilentlyContinue to prevent Write-Progress console errors
    const cmd = `powershell -NoProfile -Command "$ProgressPreference = 'SilentlyContinue'; Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('${distDir.replace(/'/g, "''")}', '${zipPath.replace(/'/g, "''")}')"`;
    execSync(cmd, { stdio: 'inherit' });

    if (fs.existsSync(zipPath)) {
      const stats = fs.statSync(zipPath);
      console.log(`\n🎉 Successfully created ${zipPath} (${(stats.size / 1024).toFixed(1)} KB)`);
    } else {
      throw new Error('ZIP file was not created.');
    }
  } catch (err) {
    console.error('Packaging failed:', err);
    process.exit(1);
  }
}

packageExtension();
