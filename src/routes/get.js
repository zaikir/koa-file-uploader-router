export default ({ model }) => async (ctx) => {
  ctx.body = await model.findById(ctx.params.id)
}
