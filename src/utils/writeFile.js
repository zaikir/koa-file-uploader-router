import fs from 'fs';

export default ({ stream, filePath }) => new Promise((resolve, reject) => {
  const writer = fs.createWriteStream(filePath);

  writer.on('error', (err) => {
    reject(err);
  });

  writer.on('finish', () => {
    writer.end();
    resolve();
  });

  stream.pipe(writer);
});
