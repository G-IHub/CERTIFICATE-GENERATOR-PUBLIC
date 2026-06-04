import fs from 'fs';
import path from 'path';

const templatesDir = 'c:/Users/OWNER/Documents/Genomac/Certifyer/src/components/templates';
const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.tsx'));

console.log(`Checking ${files.length} template files...`);

for (const file of files) {
  const filePath = path.join(templatesDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');

  // Check if themeColors is destructured/present in props
  const hasThemeColorsProp = content.includes('themeColors');
  
  if (!hasThemeColorsProp) {
    console.log(`- ${file}: Does NOT have themeColors in file at all.`);
    continue;
  }

  // Count occurrences of themeColors
  const occurrences = (content.match(/themeColors/g) || []).length;
  // If it's only declared in interface and destructured in props, occurrences is 3 or less
  // 1: import type { ThemeColors } from ...
  // 2: themeColors?: ThemeColors;
  // 3: themeColors, (destructured)
  if (occurrences <= 3) {
    console.log(`- ${file}: Declares themeColors (occurrences: ${occurrences}) but does NOT use it!`);
  }
}
