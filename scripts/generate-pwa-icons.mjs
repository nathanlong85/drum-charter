import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const inputSvg = path.join(process.cwd(), 'public/icons/icon-192x192.svg');
const outputDir = path.join(process.cwd(), 'public/icons');

const sizes = [192, 512];

async function generateIcons() {
  if (!fs.existsSync(inputSvg)) {
    console.error(`Input SVG not found: ${inputSvg}`);
    process.exit(1);
  }

  for (const size of sizes) {
    const outputFile = path.join(outputDir, `icon-${size}x${size}.png`);

    try {
      await sharp(inputSvg).resize(size, size).png().toFile(outputFile);

      console.log(`Generated ${outputFile}`);
    } catch (err) {
      console.error(`Error generating ${outputFile}:`, err);
      process.exit(1);
    }
  }
}

generateIcons();
