import rotateFile from '../utils/rotateFile';

export default ({ model, provider, uploadsFolder }) => async (ctx) => {
  await rotateFile({
    fileId: ctx.params.id,
    headers: ctx.headers,
    uploadsFolder,
    angle: ctx.request.body.angle,
    model,
    provider,
  });

  ctx.body = 'OK';
};
