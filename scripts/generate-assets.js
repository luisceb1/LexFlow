#!/usr/bin/env node

/**
 * Script para generar assets de iconos y splash screen
 * 
 * Uso:
 * 1. Coloca tu imagen base (icono-calendario.png) en la raíz del proyecto
 * 2. Ejecuta: node scripts/generate-assets.js
 * 
 * Requisitos:
 * - ImageMagick instalado (brew install imagemagick en macOS)
 * - O usa la versión online en ACTUALIZAR_ICONOS.md
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const SOURCE_IMAGE = process.argv[2] || 'icono.jpg';

// Tamaños requeridos
const SIZES = {
  icon: { width: 1024, height: 1024, name: 'icon.png' },
  adaptiveIcon: { width: 1024, height: 1024, name: 'adaptive-icon.png' },
  splash: { width: 1242, height: 2436, name: 'splash.png' },
  favicon: { width: 48, height: 48, name: 'favicon.png' },
  notification: { width: 96, height: 96, name: 'notification-icon.png' },
};

function checkImageMagick() {
  try {
    execSync('which convert', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function generateAsset(sourcePath, outputPath, width, height) {
  try {
    // Verificar que existe ImageMagick
    if (!checkImageMagick()) {
      console.error('❌ ImageMagick no está instalado.');
      console.error('   Instálalo con: brew install imagemagick (macOS)');
      console.error('   O usa la guía en ACTUALIZAR_ICONOS.md para herramientas online');
      return false;
    }

    // Verificar que existe la imagen fuente
    if (!fs.existsSync(sourcePath)) {
      console.error(`❌ No se encontró la imagen: ${sourcePath}`);
      console.error('   Coloca tu imagen base en la raíz del proyecto o especifica la ruta:');
      console.error('   node scripts/generate-assets.js ruta/a/tu/imagen.png');
      return false;
    }

    // Crear directorio assets si no existe
    if (!fs.existsSync(ASSETS_DIR)) {
      fs.mkdirSync(ASSETS_DIR, { recursive: true });
    }

    // Generar el asset con ImageMagick
    const command = `convert "${sourcePath}" -resize ${width}x${height}! -background white -gravity center -extent ${width}x${height} "${outputPath}"`;
    execSync(command, { stdio: 'inherit' });
    
    console.log(`✅ Generado: ${path.basename(outputPath)} (${width}x${height})`);
    return true;
  } catch (error) {
    console.error(`❌ Error generando ${outputPath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🎨 Generador de Assets para LexFlow\n');
  
  const sourcePath = path.isAbsolute(SOURCE_IMAGE) 
    ? SOURCE_IMAGE 
    : path.join(__dirname, '..', SOURCE_IMAGE);

  console.log(`📁 Imagen fuente: ${sourcePath}\n`);

  let successCount = 0;
  let totalCount = Object.keys(SIZES).length;

  // Generar cada asset
  for (const [key, config] of Object.entries(SIZES)) {
    const outputPath = path.join(ASSETS_DIR, config.name);
    
    if (key === 'splash') {
      // Para splash, hacer el icono más grande y centrado
      console.log(`📱 Generando splash screen...`);
      if (generateAsset(sourcePath, outputPath, config.width, config.height)) {
        successCount++;
      }
    } else {
      if (generateAsset(sourcePath, outputPath, config.width, config.height)) {
        successCount++;
      }
    }
  }

  console.log(`\n📊 Resultado: ${successCount}/${totalCount} assets generados`);

  if (successCount === totalCount) {
    console.log('\n✅ ¡Todos los assets se generaron correctamente!');
    console.log('   Los archivos están en: assets/');
    console.log('\n   Próximos pasos:');
    console.log('   1. Verifica que los iconos se vean bien');
    console.log('   2. Ejecuta: npx expo prebuild --clean');
    console.log('   3. Ejecuta: npx expo run:ios o npx expo run:android');
  } else {
    console.log('\n⚠️  Algunos assets no se pudieron generar.');
    console.log('   Revisa los errores arriba o usa la guía en ACTUALIZAR_ICONOS.md');
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateAsset, SIZES };

