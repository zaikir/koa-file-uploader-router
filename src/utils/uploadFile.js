import Busboy from 'busboy';
import path from 'path';
import ObjectID from 'bson-objectid';
import generateFilename from './generateFilename';
import writeFile from './writeFile';

export default ({
  headers,
  stream,
  uploadsFolder = path.resolve('uploads'),
  allowedFormats = '*',
}) => new Promise((resolve, reject) => {
  let isFileDetected = false;

  const busboy = new Busboy({ headers });

  busboy.on('file', async (fieldname, fileStream, filename) => {
    isFileDetected = true;

    if (allowedFormats !== '*' && !allowedFormats.includes(path.extname(filename).substring(1).toLowerCase())) {
      reject(new Error('File format is not allowed'));
    }

    try {
      const id = ObjectID().toString();
      const filePath = await generateFilename({ uploadsFolder, filename: `${id}_${filename}` });

      await writeFile(fileStream, filePath);

      resolve({ id });
    } catch (err) {
      reject(err);
    }
  });

  busboy.on('finish', () => {
    if (!isFileDetected) {
      reject(new Error('No file uploaded'));
    }
  });

  stream.pipe(busboy);
});
