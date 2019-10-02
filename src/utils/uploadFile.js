import Busboy from 'busboy';
import path from 'path';
import generateFilename from './generateFilename';
import writeFile from './writeFile';

export default ({
  model: Model,
  headers,
  stream,
  uploadsFolder,
  allowedFormats,
}) => new Promise((resolve, reject) => {
  let isFileDetected = false;

  const busboy = new Busboy({ headers });

  busboy.on('file', async (fieldname, fileStream, filename) => {
    isFileDetected = true;

    if (allowedFormats !== '*' && !allowedFormats.includes(path.extname(filename).substring(1).toLowerCase())) {
      reject(new Error('File format is not allowed'));
    }

    try {
      const filePath = await generateFilename({ uploadsFolder, filename: `${new Date().valueOf()}_${filename}` });

      await writeFile({ stream: fileStream, filePath });

      const { id, type } = await new Model({
        path: filePath.replace(uploadsFolder, ''),
        type: path.extname(filePath),
      }).save();

      resolve({ id, type });
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
