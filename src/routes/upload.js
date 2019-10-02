// export default () => async (ctx) => {
//   ctx.body = await model.create(await preCreate(ctx));

//   if (postCreate) {
//     await postCreate(ctx.body);
//   }
// };

import uploadFile from '../utils/uploadFile';

export default ({ prefix, allowedFormats, uploadsFolder }) => async (ctx) => {
  const { id } = await uploadFile({
    headers: ctx.headers,
    stream: ctx.req,
    allowedFormats,
    uploadsFolder,
  });

  ctx.body = {
    url: `${config.domain}/images/${id}`,
    public_id: id,
    format,
    width,
    height,
  };
};
