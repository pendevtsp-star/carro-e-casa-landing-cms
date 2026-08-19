const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dir = 'C:/Users/maxue/Downloads/fotos loja-carro-e-casa';
const files = fs.readdirSync(dir);

async function inspect() {
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png')) {
      const meta = await sharp(full).metadata();
      console.log(`IMG: ${f} | ${meta.width}x${meta.height} | ${(stat.size/1024).toFixed(0)}KB | format: ${meta.format}`);
    } else {
      console.log(`OTHER: ${f} | ${(stat.size/1024/1024).toFixed(2)}MB`);
    }
  }
}

inspect();
