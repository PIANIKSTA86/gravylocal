import fs from 'fs';
import path from 'path';

const srcDir = path.resolve('dist');
const dstDir = path.resolve('../pb_public/mobile');

function copyFolderRecursiveSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  if (fs.lstatSync(source).isDirectory()) {
    const files = fs.readdirSync(source);
    files.forEach((file) => {
      const curSource = path.join(source, file);
      const curTarget = path.join(target, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, curTarget);
      } else {
        fs.copyFileSync(curSource, curTarget);
      }
    });
  }
}

try {
  if (fs.existsSync(dstDir)) {
    fs.rmSync(dstDir, { recursive: true, force: true });
  }
  copyFolderRecursiveSync(srcDir, dstDir);
  console.log('[GRAVY Mobile] Despliegue en pb_public/mobile completado con éxito!');
} catch (err) {
  console.error('[GRAVY Mobile] Error al copiar a pb_public/mobile:', err);
}
