import path from 'path';
import generateFilename from './src/utils/generateFilename';
import writeFile from './src/utils/writeFile';

export default async ({ stream, filename = '', uploadsFolder = path.resolve('uploads') }) => {
  const filePath = await generateFilename({ uploadsFolder, filename: `${new Date().valueOf()}${filename ? `_${filename}` : ''}` });

  await writeFile({ stream, filePath });

  return filePath;
};
