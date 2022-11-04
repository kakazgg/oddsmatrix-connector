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
  // finding logos
  if (req?.query?.typeId === "1") {
    docs = docs.map(async (event) => {
      const cloneEvent = { ...event };
      const relations = await db
        .collection("EventParticipantRelation")
        .find({ eventId: cloneEvent.id })
        .toArray();
      const participantIds = relations.map((par) => par.participantId);
      let logosPromise = await db
        .collection("Participant")
        .find({ id: { $in: participantIds } })
        .toArray();
      logosPromise = logosPromise
        .filter((item) => item?.logoUrl)
        .map((item) => item.logoUrl);

      return { ...cloneEvent, logos: logosPromise };
    });
    docs = await Promise.all(docs);
  }

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
exports.events2 = catchAsync(async (req, res, next) => {
  if (req.query?.isComplete && req.query?.isComplete === "true") {
    req.query.isComplete = true;
  } else if (req.query?.isComplete && req.query?.isComplete === "false") {
    req.query.isComplete = false;
  }
  let docs = new ApiFeatures(db.collection("Event"), {
    ...req.query,
    typeId: "2",
  })
    .filter()
    .paginate()
    .sort();

  docs = await docs.query.toArray();
  // finding logos
  if (req?.query?.typeId === "1") {
    const parentIds = docs.map((item) => item.id);
    docs = await db
      .collection("Event")
      .find({ parentId: { $in: parentIds }, typeId: "1" })
      .toArray();
    docs = docs.map(async (event) => {
      const cloneEvent = { ...event };
      const relations = await db
        .collection("EventParticipantRelation")
        .find({ eventId: cloneEvent.id })
        .toArray();
      const participantIds = relations.map((par) => par.participantId);
      let logosPromise = await db
        .collection("Participant")
        .find({ id: { $in: participantIds } })
        .toArray();
      logosPromise = logosPromise
        .filter((item) => item?.logoUrl)
        .map((item) => item.logoUrl);

      return { ...cloneEvent, logos: logosPromise };
    });

    docs = await Promise.all(docs);
  }

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
exports.sports = catchAsync(async (req, res, next) => {
  let sports = await db.collection("Sport").find({}).sort("name").toArray();
  sports = sports.map(async (sport) => {
    try {
      const event = await db.collection("Event").findOne({ sportId: sport.id });
      if (event) {
        return sport;
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  });
  sports = await Promise.all(sports);
  sports = sports.filter((sport) => sport !== null);
  const total = sports.length;
  res.status(200).json({
    status: "success",
    total,
    result: sports.length,
    data: sports,
  });
});
exports.leagues = catchAsync(async (req, res, next) => {
  const { sportId } = req.query;
  let leagues = await db
    .collection("EventTemplate")
    .find({ sportId })
    .sort("name")
    .toArray();
  leagues = leagues.map(async (league) => {
    try {
      const event = await db.collection("Event").findOne({
        templateId: league.id,
        typeId: "2",
      });
      if (event) {
        return league;
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  });
  leagues = await Promise.all(leagues);
  leagues = leagues.filter((league) => league !== null);
  const total = leagues.length;
  res.status(200).json({
    status: "success",
    total,
    result: leagues.length,
    data: leagues,
  });
});
