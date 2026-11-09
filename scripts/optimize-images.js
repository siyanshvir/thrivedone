/**
 * Image Optimization Script
 * Converts team photos to WebP format for better performance
 * 
 * Note: Requires sharp package
 * Install: npm install --save-dev sharp
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function optimizeImages() {
  console.log('Image Optimization Script\n');
  
  // Check if sharp is installed
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch (e) {
    console.log('Sharp is not installed.');
    console.log('   To enable image optimization, run:');
    console.log('   npm install --save-dev sharp\n');
    console.log('   Then run this script again: npm run optimize:images\n');
    return;
  }
  
  const teamDir = path.join(__dirname, '../public/team');
  const files = fs.readdirSync(teamDir).filter(f => f.endsWith('.jpg'));
  
  console.log(`Found ${files.length} team photos to optimize\n`);
  
  let totalSaved = 0;
  
  for (const file of files) {
    const inputPath = path.join(teamDir, file);
    const outputPath = path.join(teamDir, file.replace('.jpg', '.webp'));
    
    const originalSize = fs.statSync(inputPath).size;
    
    try {
      await sharp(inputPath)
        .webp({ quality: 85 })
        .toFile(outputPath);
      
      const newSize = fs.statSync(outputPath).size;
      const saved = originalSize - newSize;
      const percent = ((saved / originalSize) * 100).toFixed(1);
      
      totalSaved += saved;
      
      console.log(`[OK] ${file.padEnd(25)} ${(originalSize/1024).toFixed(1)}KB -> ${(newSize/1024).toFixed(1)}KB (${percent}% smaller)`);
    } catch (err) {
      console.log(`[FAIL] ${file} - Error: ${err.message}`);
    }
  }
  
  console.log(`\nOptimization complete!`);
  console.log(`   Total saved: ${(totalSaved/1024).toFixed(1)}KB`);
  console.log(`\nNext steps:`);
  console.log(`   1. Update Team.tsx to use .webp images with .jpg fallbacks`);
  console.log(`   2. Test in browser to ensure images load correctly`);
  console.log(`   3. If all looks good, you can delete the .jpg files`);
}

optimizeImages();
