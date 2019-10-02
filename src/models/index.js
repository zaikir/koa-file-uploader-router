export default ({ mongoose, modelName }) => {
  const schema = new mongoose.Schema({
    path: String,
    type: String,
  }, {
    timestamps: true,
  });

  return mongoose.model(modelName, schema);
};
