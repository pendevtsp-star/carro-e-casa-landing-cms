const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const mediaDir = 'C:/Users/maxue/Downloads/fotos loja-carro-e-casa';
const facadePath = path.join(mediaDir, 'foto da frente da loja.jpeg');
const aislePath = path.join(mediaDir, 'WhatsApp Image 2026-08-13 at 13.48.03 (1).jpeg');
const counterPath = path.join(mediaDir, 'WhatsApp Image 2026-08-13 at 13.48.04 (2).jpeg');
const logoPath = path.join(mediaDir, 'ChatGPT Image 14 de ago. de 2026, 22_22_15.png');

async function testPrototype() {
  const outDir = path.join(__dirname, '../scratch_anim_proto');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const targetW = 1920;
  const targetH = 1080;

  // Let's test generating sample frames:
  // 1. Facade start (frame 1)
  // 2. Facade zoomed towards door (frame 60)
  // 3. Aisle entry (frame 90)
  // 4. Aisle walking (frame 150)
  // 5. Counter approach (frame 200)
  // 6. Counter logo zoom (frame 250)
  // 7. Full logo final (frame 300)

  // 1. Facade frame 1
  const facadeBase = await sharp(facadePath)
    .resize(targetW, targetH, { fit: 'cover', position: 'center' })
    .toBuffer();
  await sharp(facadeBase).toFile(path.join(outDir, 'frame_001.jpg'));

  // 2. Facade frame 60 (zoomed into glass door #205, center-bottom)
  const facadeMeta = await sharp(facadePath).metadata();
  // Crop into door area
  const cropW = Math.round(facadeMeta.width * 0.6);
  const cropH = Math.round(cropW * (targetH / targetW));
  const cropLeft = Math.round((facadeMeta.width - cropW) * 0.58);
  const cropTop = Math.round(facadeMeta.height * 0.35);

  await sharp(facadePath)
    .extract({ left: cropLeft, top: cropTop, width: cropW, height: cropH })
    .resize(targetW, targetH)
    .toFile(path.join(outDir, 'frame_060.jpg'));

  // 3. Aisle start (frame 90)
  const aisleMeta = await sharp(aislePath).metadata();
  const aCropW = Math.round(aisleMeta.width * 0.95);
  const aCropH = Math.round(aCropW * (targetH / targetW));
  const aCropLeft = Math.round((aisleMeta.width - aCropW) * 0.5);
  const aCropTop = Math.round(aisleMeta.height * 0.25);

  await sharp(aislePath)
    .extract({ left: aCropLeft, top: aCropTop, width: aCropW, height: aCropH })
    .resize(targetW, targetH)
    .toFile(path.join(outDir, 'frame_090.jpg'));

  // 4. Aisle zoomed / moving forward (frame 150)
  const a2CropW = Math.round(aisleMeta.width * 0.65);
  const a2CropH = Math.round(a2CropW * (targetH / targetW));
  const a2CropLeft = Math.round((aisleMeta.width - a2CropW) * 0.45);
  const a2CropTop = Math.round(aisleMeta.height * 0.32);

  await sharp(aislePath)
    .extract({ left: a2CropLeft, top: a2CropTop, width: a2CropW, height: a2CropH })
    .resize(targetW, targetH)
    .toFile(path.join(outDir, 'frame_150.jpg'));

  // 5. Counter approach (frame 200)
  const cMeta = await sharp(counterPath).metadata();
  const cCropW = Math.round(cMeta.width * 0.95);
  const cCropH = Math.round(cCropW * (targetH / targetW));
  const cCropLeft = Math.round((cMeta.width - cCropW) * 0.5);
  const cCropTop = Math.round(cMeta.height * 0.2);

  await sharp(counterPath)
    .extract({ left: cCropLeft, top: cCropTop, width: cCropW, height: cCropH })
    .resize(targetW, targetH)
    .toFile(path.join(outDir, 'frame_200.jpg'));

  // 6. Counter logo zoom (frame 250)
  const c2CropW = Math.round(cMeta.width * 0.55);
  const c2CropH = Math.round(c2CropW * (targetH / targetW));
  const c2CropLeft = Math.round((cMeta.width - c2CropW) * 0.45);
  const c2CropTop = Math.round(cMeta.height * 0.45);

  await sharp(counterPath)
    .extract({ left: c2CropLeft, top: c2CropTop, width: c2CropW, height: c2CropH })
    .resize(targetW, targetH)
    .toFile(path.join(outDir, 'frame_250.jpg'));

  // 7. Full logo final (frame 300)
  await sharp(logoPath)
    .resize(targetW, targetH, { fit: 'cover', position: 'center' })
    .toFile(path.join(outDir, 'frame_300.jpg'));

  console.log('Prototype sample frames created!');
}

testPrototype().catch(console.error);
