const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const mediaDir = 'C:/Users/maxue/Downloads/fotos loja-carro-e-casa';
const facadePath = path.join(mediaDir, 'foto da frente da loja.jpeg');
const aislePath = path.join(mediaDir, 'WhatsApp Image 2026-08-13 at 13.48.03 (1).jpeg');
const counterPath = path.join(mediaDir, 'WhatsApp Image 2026-08-13 at 13.48.04 (2).jpeg');
const logoPath = path.join(mediaDir, 'ChatGPT Image 14 de ago. de 2026, 22_22_15.png');

const outDir = path.join(__dirname, '../scratch_wide_anim');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const targetW = 1600;
const targetH = 900;

// Test generating wide shots for each phase
async function testWideFraming() {
  const facadeMeta = await sharp(facadePath).metadata();
  const aisleMeta = await sharp(aislePath).metadata();
  const counterMeta = await sharp(counterPath).metadata();
  const logoMeta = await sharp(logoPath).metadata();

  console.log('Facade:', facadeMeta);
  console.log('Aisle:', aisleMeta);
  console.log('Counter:', counterMeta);

  // 1. Facade wide (full width 1448, 16:9 height = 814)
  // Let's frame from top=120 to capture the whole Carro & Casa yellow sign, bricks, and entrance
  const fW = facadeMeta.width;
  const fH = Math.round(fW * (targetH / targetW));
  await sharp(facadePath)
    .extract({ left: 0, top: 120, width: fW, height: fH })
    .resize(targetW, targetH)
    .toFile(path.join(outDir, 'facade_wide.jpg'));

  // 2. Aisle wide (full width 1201, 16:9 height = 675)
  // Let's frame around y = 350 to capture the whole store: ceiling lights, left shelves, black barrel, right yellow shelves, and back counter
  const aW = aisleMeta.width;
  const aH = Math.round(aW * (targetH / targetW));
  await sharp(aislePath)
    .extract({ left: 0, top: 380, width: aW, height: aH })
    .resize(targetW, targetH)
    .toFile(path.join(outDir, 'aisle_wide.jpg'));

  // 3. Counter wide (full width 1201, 16:9 height = 675)
  // Let's frame around y = 320 to capture the TV, full wooden desk, Carro & Casa logo, and right shelves
  const cW = counterMeta.width;
  const cH = Math.round(cW * (targetH / targetW));
  await sharp(counterPath)
    .extract({ left: 0, top: 340, width: cW, height: cH })
    .resize(targetW, targetH)
    .toFile(path.join(outDir, 'counter_wide.jpg'));

  // 4. Logo wide
  await sharp(logoPath)
    .resize(targetW, targetH, { fit: 'cover' })
    .toFile(path.join(outDir, 'logo_wide.jpg'));

  console.log('Wide test frames saved!');
}

testWideFraming().catch(console.error);
