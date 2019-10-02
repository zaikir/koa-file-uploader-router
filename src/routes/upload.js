import uploadFile from '../utils/uploadFile';

export default ({
  fullPrefix, model, allowedFormats, uploadsFolder,
}) => async (ctx) => {
  const { id } = await uploadFile({
    headers: ctx.headers,
    stream: ctx.req,
    allowedFormats,
    uploadsFolder,
    model,
  });

  ctx.body = {
    url: `${fullPrefix}/${id}`,
    public_id: id,
  };
};
