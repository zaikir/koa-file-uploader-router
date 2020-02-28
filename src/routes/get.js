import sendFile from 'koa-send';
import sharp from 'sharp';
import path from 'path';

const fitMap = {
  mfit: 'outside',
  lfill: 'inside',
  fill: 'fill',
  cover: 'cover',
  contain: 'contain',
  inside: 'inside',
  limit: 'inside',
  outside: 'outside',
};

const gravityMap = {
  auto: 'attention',
  north: 'north',
  northeast: 'northeast',
  north_east: 'northeast',
  east: 'east',
  southeast: 'southeast',
  south_east: 'southeast',
  south: 'south',
  southwest: 'southwest',
  south_west: 'southwest',
  west: 'west',
  northwest: 'northwest',
  north_west: 'northwest',
  center: 'center',
};


const relativeToAbsolute = (val, max) => (val <= 1 ? Math.round(val * max) : +val || undefined);
const limit = (val, max) => (val > max ? max : val);

export default ({
  model: Model, provider, uploadsFolder, notFoundMiddleware = (ctx, error) => {
    ctx.body = error;
    ctx.status = 404;
  },
}) => async (ctx) => {
  const { transformString = '', id, format } = ctx.params;

  const sendFileConfig = {
    immutable: true,
    root: uploadsFolder,
  };

  const file = Model
    ? await Model.findById(id)
    : await provider.get(id);

  if (!file) {
    notFoundMiddleware(ctx);
    return;
  }

  if (!transformString.length && !format) {
    try {
      await sendFile(ctx, file.path, sendFileConfig);
    } catch (err) {
      if (ctx.status === 404) {
        notFoundMiddleware(ctx, err.message);
      }
    }

    return;
  }

  const transformedImage = (file.transformedImages || [])
    .find(i => i.selector === transformString && i.format === format);

  if (transformedImage) {
    try {
      await sendFile(ctx, transformedImage.path, sendFileConfig);
    } catch (err) {
      if (ctx.status === 404) {
        notFoundMiddleware(ctx, err.message);
      }
    }

    return;
  }

  const width = (transformString.match(/\bw_([\d.]+)/) || [])[1];
  const height = (transformString.match(/\bh_([\d.]+)/) || [])[1];
  const fit = (transformString.match(/c_([a-z]+)/) || [])[1];
  const gravity = (transformString.match(/g_([a-z]+)/) || [])[1];
  const croppingX = (transformString.match(/cx_([\d.]+)/) || [])[1];
  const croppingY = (transformString.match(/cy_([\d.]+)/) || [])[1];
  const croppingWidth = (transformString.match(/cw_([\d.]+)/) || [])[1];
  const croppingHeight = (transformString.match(/ch_([\d.]+)/) || [])[1];
  const extractArea = croppingX || croppingY || croppingWidth || croppingHeight;


  if (extractArea && !(croppingX && croppingY && croppingWidth && croppingHeight)) {
    ctx.status = 400;
    ctx.body = 'All cropping area parameters are required';
    return;
  }

  try {
    const sharpImage = sharp(path.join(uploadsFolder, file.path));

    const metadata = await sharpImage.metadata();

    const quality = {
      quality: process.env.RESIZING_QUALITY || 90,
    };

    if (extractArea) {
      sharpImage.extract({
        left: relativeToAbsolute(croppingX, metadata.width),
        top: relativeToAbsolute(croppingY, metadata.height),
        width: relativeToAbsolute(croppingWidth, metadata.width),
        height: relativeToAbsolute(croppingHeight, metadata.height),
      });
    }

    if (width || height) {
      const w = relativeToAbsolute(width, metadata.width);
      const h = relativeToAbsolute(height, metadata.height);

      sharpImage.resize(
        fit === 'limit' ? limit(w, metadata.width) : w,
        fit === 'limit' ? limit(h, metadata.height) : h,
        {
          fit: fitMap[fit],
          fastShrinkOnLoad: true,
          position: gravityMap[gravity],
        },
      ).jpeg(quality);
    }


    if (format) {
      sharpImage.toFormat(format, quality);
    }

    const transformedBasename = path.basename(file.path, path.extname(file.path));
    const transformedExtension = format ? `.${format}` : path.extname(file.path);
    const transformedPath = path.join(
      path.dirname(file.path),
      `${transformedBasename}-${transformString}${transformedExtension}`,
    );

    await sharpImage.toFile(path.join(uploadsFolder, transformedPath));
    sharpImage.end();

    file.transformedImages = file.transformedImages || [];
    file.transformedImages.push({
      selector: transformString,
      format,
      path: transformedPath,
    });

    if (Model) {
      await file.save();
    } else {
      await provider.update(file);
    }


    try {
      await sendFile(ctx, transformedPath, sendFileConfig);
    } catch (err) {
      if (ctx.status === 404) {
        notFoundMiddleware(ctx, err.message);
      }
    }
  } catch (err) {
    notFoundMiddleware(ctx, err.message);
  }
};
