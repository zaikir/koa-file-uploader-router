import sendFile from "koa-send";
import path from "path";

export default ({
    model: Model,
    provider,
    uploadsFolder,
    notFoundMiddleware = (ctx, error) => {
      ctx.body = error;
      ctx.status = 404;
    },
  }) =>
  async (ctx) => {
    const { transformString = "", id, format } = ctx.params;

    const sendFileConfig = {
      immutable: true,
      root: uploadsFolder,
      ...(ctx.query.range && {
        setHeaders: (res) => {
          res.setHeader("Accept-Ranges", "bytes");
        },
      }),
    };

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
