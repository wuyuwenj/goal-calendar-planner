const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');
const svgPath = path.join(assetsDir, 'trellis-icon.svg');

async function generateIcons() {
  const svgBuffer = fs.readFileSync(svgPath);

  // Generate icon.png (1024x1024 for iOS App Store)
  await sharp(svgBuffer)
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'icon.png'));
  console.log('Generated icon.png (1024x1024)');

  // Generate adaptive-icon.png (1024x1024 for Android adaptive icon foreground)
  await sharp(svgBuffer)
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'adaptive-icon.png'));
  console.log('Generated adaptive-icon.png (1024x1024)');

  // Generate splash.png (larger for splash screen with padding)
  // Create a splash screen with the icon centered on gradient background
  const splashSize = 2048;
  const iconSize = 512;

  // Generate the icon at splash icon size
  const iconBuffer = await sharp(svgBuffer)
    .resize(iconSize, iconSize)
    .png()
    .toBuffer();

  // Create splash with gradient background and centered icon
  await sharp(svgBuffer)
    .resize(splashSize, splashSize)
    .png()
    .toFile(path.join(assetsDir, 'splash.png'));
  console.log('Generated splash.png (2048x2048)');

  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
