const Entity = require("../models/entityModel");
const catchAsync = require("../utils/catchAsync");
const ApiFeatures = require("../utils/apiFeatures");

exports.removeInitialData = async () => {
  await Entity.deleteMany();
};
exports.initializeEntities = async (entities) => {
  for (let i = 0; i < entities.length; i++) {
    await Entity.create(entities[i]);
  }
  // await Entity.insertMany(entities);
};

exports.updateInitializeEntities = async (changes) => {
  const allPromise = changes.map(async (entity) => {
    if (entity.type === "update") {
      return await Entity.findOneAndUpdate(
        { id: entity.id, entityClass: entity.entityClass },
        entity
      );
    } else if (entity.type === "delete") {
      return await Entity.findOneAndDelete({
        id: entity.id,
        entityClass: entity.entityClass,
      });
    }
  });
  await Promise.all(allPromise);
};

exports.getEntities = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(Entity.find(), { ...req.query })
    .filter()
    .paginate()
    .sort()
    .limitFields();
  const entities = await features.query;
  if (req?.query?.limit) {
    req.query.limit = undefined;
    req.query.page = undefined;
  }
  req.query.sort = undefined;
  const total = await Entity.countDocuments(req.query);
  res.status(200).json({
    status: "success",
    total,
    result: entities.length,
    data: entities,
  });
});
