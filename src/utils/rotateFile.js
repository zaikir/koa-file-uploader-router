import path from 'path';
import sharp from 'sharp';

export default async ({
  model: Model,
  provider,
  fileId,
  uploadsFolder,
  angle,
}) => {
  const file = Model
    ? await Model.findById(fileId)
    : await provider.get(fileId);

  const pathToFile = path.join(uploadsFolder, file.path);
  const buffer = await sharp(pathToFile).rotate(angle).toBuffer();

  await sharp(buffer).toFile(pathToFile);


  file.transformedImages = [];

  if (Model) {
    await file.save();
  } else {
    await provider.update(file);
  }
};
