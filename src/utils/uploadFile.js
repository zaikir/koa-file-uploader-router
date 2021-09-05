import Busboy from 'busboy';
import path from 'path';
import { getPlaiceholder } from 'plaiceholder';
import sanitize from 'sanitize-filename';
import sharp from 'sharp';
import { uploadFile } from '../..';

export default ({
  model: Model,
  provider,
  headers,
  stream,
  uploadsFolder,
  allowedFormats,
  fullPrefix,
}) => new Promise((resolve, reject) => {
  let isFileDetected = false;

  const busboy = new Busboy({ headers });
  const data = {};
  busboy.on('field', (fieldname, val) => {
    data[fieldname] = val;
  });

  busboy.on('file', async (fieldname, fileStream, filename) => {
    isFileDetected = true;

    const sanitizedFilename = sanitize(filename).replace(/%/g, '');
    if (allowedFormats !== '*' && !allowedFormats.includes(path.extname(sanitizedFilename).substring(1).toLowerCase())) {
      reject(new Error('File format is not allowed'));
    }

    try {
      const filePath = await uploadFile({ stream: fileStream, filename: sanitizedFilename, uploadsFolder });

      let width = 0;
      let height = 0;
      let imagePlaceholder = 0;

      try {
        const sharpImage = sharp(filePath);
        const metadata = await sharpImage.metadata();

        width = metadata.width || 0;
        height = metadata.height || 0;
      // eslint-disable-next-line no-empty
      } catch (err) {
        // noop
      }

      try {
        const { base64 } = await getPlaiceholder(filePath);
        imagePlaceholder = base64;
      // eslint-disable-next-line no-empty
      } catch (err) {
        // noop
      }

      const { id } = Model ? await new Model({
        path: filePath.replace(uploadsFolder, ''),
        type: path.extname(filePath),
        name: sanitizedFilename,
        transformedImages: [],
        width,
        height,
        imagePlaceholder,
        ...Object.assign({}, ...Object.entries(data).map(([key, value]) => ({ [key]: value }))),
      }).save()
        : await provider.create({
          path: filePath.replace(uploadsFolder, ''),
          name: sanitizedFilename,
          type: path.extname(filePath),
          width,
          height,
          imagePlaceholder,
          transformedImages: [],
          ...Object.assign({}, ...Object.entries(data).map(([key, value]) => ({ [key]: value }))),
        });

      const url = `${fullPrefix}/${id}`;

      if (Model) {
        await Model.updateOne({ _id: id }, { $set: { url } });
      } else {
        await provider.update({ id, url, transformedImages: [] });
      }

      resolve({
        id, name: sanitizedFilename, type: path.extname(filePath), url,
      });
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
