import uploadFile from '../utils/uploadFile';

export default ({
  fullPrefix, model, allowedFormats, uploadsFolder, provider,
}) => async (ctx) => {
  const {
    id, type, name, url,
  } = await uploadFile({
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
    name,
    public_id: id,
    id,
  };
};
