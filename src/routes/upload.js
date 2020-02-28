import uploadFile from '../utils/uploadFile';

export default ({
  fullPrefix, model, allowedFormats, uploadsFolder, provider,
}) => async (ctx) => {
  const { id, type, url } = await uploadFile({
    headers: ctx.headers,
    stream: ctx.req,
    allowedFormats,
    uploadsFolder,
    model,
    provider,
    fullPrefix,
  });

  ctx.body = {
    url,
    type,
    public_id: id,
  };
};
