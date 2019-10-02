import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);

export default dirPath => dirPath
  .split(path.sep)
  .reduce(async (prevPath, folder) => {
    const currentPath = path.join(await prevPath, folder, path.sep);

    if (!await exists(currentPath)) {
      await mkdir(currentPath);
    }

    return currentPath;
  }, '');
