import fs from 'fs';
import ExifTransformer from 'exif-be-gone';

export default ({ stream: reader, filePath }) => new Promise((resolve, reject) => {
  const writer = fs.createWriteStream(filePath);

  writer.on('error', (err) => {
    reject(err);
  });

  writer.on('finish', () => {
    writer.end();
    resolve();
  });

  // .pipe(new ExifTransformer())
  reader.pipe(writer);
});
