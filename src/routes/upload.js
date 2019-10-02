import uploadFile from '../utils/uploadFile';

export default ({
  fullPrefix, model, allowedFormats, uploadsFolder,
}) => async (ctx) => {
  const { id, type } = await uploadFile({
    headers: ctx.headers,
    stream: ctx.req,
    allowedFormats,
    uploadsFolder,
    model,
  });

  // eslint-disable-next-line no-console
  console.log(type);
  ctx.body = {
    url: `${fullPrefix}/${id}`,
    type,
    public_id: id,
  };
};
