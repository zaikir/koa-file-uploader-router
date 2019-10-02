import path from 'path';
import ensureDir from './ensureDir';

export default async ({ uploadsFolder, filename }) => {
  const now = new Date();
  const dirName = path.join(
    uploadsFolder,
    now.getUTCFullYear().toString(),
    (now.getUTCMonth() + 1).toString(),
    now.getUTCDate().toString(),
  );

  await ensureDir(dirName);

  return path.join(
    dirName,
    filename.replace('jpeg', 'jpg'),
  );
};
