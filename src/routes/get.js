import sendFile from 'koa-send';

export default ({ model, uploadDir, mongoose }) => async (ctx) => {
  const { id } = ctx.params;

  const sendFileConfig = {
    immutable: true,
    root: uploadDir,
  };

  if (!mongoose.mongo.ObjectId.isValid(id)) {
    ctx.status = 404;
    return;
  }

  const file = await model.findById(id);
  if (!file) {
    ctx.status = 404;
    return;
  }

  await sendFile(ctx, file.path, sendFileConfig);
};
