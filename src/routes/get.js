import sendFile from 'koa-send';

export default ({
  model: Model,
  provider,
  uploadsFolder,
  notFoundMiddleware = (ctx, error) => {
    ctx.body = error;
    ctx.status = 404;
  },
}) => async (ctx) => {
  console.log('here');
  const { id } = ctx.params;

  console.log(id);

  const sendFileConfig = {
    immutable: true,
    root: uploadsFolder,
    ...(ctx.query.range && {
      setHeaders: (res) => {
        res.setHeader('Accept-Ranges', 'bytes');
      },
    }),
  };

  console.log(sendFileConfig);

  const file = Model ? await Model.findById(id) : await provider.get(id);

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
