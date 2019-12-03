export default ({ mongoose, modelName }) => {
  const schema = new mongoose.Schema({
    path: String,
    type: String,
    transformedImages: [{
      selector: String,
      format: String,
      path: String,
    }],
  }, {
    timestamps: true,
  });

  return mongoose.model(modelName, schema);
};
