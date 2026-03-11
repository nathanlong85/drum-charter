import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// We can't easily import SymbolPicker and its private 'symbolToIcon' 
// without exporting it or using some trickery.
// But we can check the file content directly for paths and verify they exist.

describe('SymbolPicker Icons', () => {
  it('all referenced icon files should exist in public directory', () => {
    const filePath = path.join(process.cwd(), 'components/groove/SymbolPicker.tsx');
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract paths like '/icons/drum-symbols/hi_hat_loose_hit_opt.svg'
    const pathRegex = /\/icons\/drum-symbols\/[a-z0-9_]+\.svg/g;
    const matches = content.match(pathRegex);
    
    expect(matches).not.toBeNull();
    
    if (matches) {
      matches.forEach((iconPath) => {
        const fullPath = path.join(process.cwd(), 'public', iconPath);
        const exists = fs.existsSync(fullPath);
        if (!exists) {
            console.error(`Icon not found: ${fullPath} (referenced as ${iconPath})`);
        }
        expect(exists).toBe(true);
      });
    }
  });
});
