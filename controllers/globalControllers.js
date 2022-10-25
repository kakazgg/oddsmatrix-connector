const catchAsync = require("../utils/catchAsync");
const ApiFeatures = require("../utils/apiFeatures");

const excludeFields = (query) => {
  const fields = ["sort", "limit", "page", "collection"];
  fields.forEach((field) => {
    delete query[field];
  });
  return query;
};

exports.global = catchAsync(async (req, res, next) => {
  const { collection } = req.query;
  let docs = new ApiFeatures(db.collection(collection), { ...req.query })
    .filter()
    .paginate()
    .sort();

  docs = await docs.query.toArray();
  const total = await db
    .collection(collection)
    .countDocuments(excludeFields({ ...req.query }));
  res.status(200).json({
    status: "success",
    total,
    result: docs.length,
    data: docs,
  });
});
exports.events = catchAsync(async (req, res, next) => {
  if (req.query?.isComplete && req.query?.isComplete === "true") {
    req.query.isComplete = true;
  } else if (req.query?.isComplete && req.query?.isComplete === "false") {
    req.query.isComplete = false;
  }
  let docs = new ApiFeatures(db.collection("Event"), { ...req.query })
    .filter()
    .paginate()
    .sort();

  docs = await docs.query.toArray();
  docs = docs.map(async (event) => {
    const cloneEvent = { ...event };
    const relations = await db
      .collection("EventParticipantRelation")
      .find({ eventId: cloneEvent.id })
      .toArray();

    let logosPromise = relations.map(async (item) => {
      const participant = await db
        .collection("Participant")
        .findOne({ id: item.participantId });

      return participant?.logoUrl;
    });
    logosPromise = await Promise.all(logosPromise);

    return { ...cloneEvent, logos: logosPromise };
  });
  docs = await Promise.all(docs);

  const total = await db
    .collection("Event")
    .countDocuments(excludeFields({ ...req.query }));
  res.status(200).json({
    status: "success",
    total,
    result: docs.length,
    data: docs,
  });
});
