import sendFile from 'koa-send';

export default ({
  model, uploadDir, mongoose, notFoundMiddleware = (ctx, error) => {
    ctx.body = error;
    ctx.status = 404;
  },
}) => async (ctx) => {
  const { id } = ctx.params;

  const sendFileConfig = {
    immutable: true,
    root: uploadDir,
  };

  if (!mongoose.mongo.ObjectId.isValid(id)) {
    notFoundMiddleware(ctx);
    return;
  }

  const file = await model.findById(id);
  if (!file) {
    notFoundMiddleware(ctx);
    return;
  }

  try {
    await sendFile(ctx, file.path, sendFileConfig);
  } catch (err) {
    if (ctx.status === 404) {
      notFoundMiddleware(ctx, err.message);
    }
  }
};
