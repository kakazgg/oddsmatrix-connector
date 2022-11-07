const catchAsync = require("../utils/catchAsync");
const ApiFeatures = require("../utils/apiFeatures");
const excludeFields = require("../utils/excludesFilterFields");

const findInitOdds = async (marketResult) => {
  let docs = marketResult.map(async (item) => {
    const marketRelations = await db
      .collection("MarketOutcomeRelation")
      .find({ marketId: item.id })
      .toArray();
    const outcomeIds = marketRelations.map((item) => item.outcomeId);

    let bettingOffer = await db
      .collection("BettingOffer")
      .find({ outcomeId: { $in: outcomeIds } })
      .toArray();
    bettingOffer = bettingOffer.map((offer) => offer.odds);
    return bettingOffer;
  });
  docs = await Promise.all(docs);
  return docs.filter((d) => d.length);
};

exports.initMarkets = catchAsync(async (req, res, next) => {
  const { eventId } = req.query;

  let HomeDrawAway = await db
    .collection("Market")
    .find({
      eventId,
      name: { $regex: "Home Draw Away, Ordinary Time", $options: "i" },
    })
    .toArray();

  if (HomeDrawAway.length) {
    HomeDrawAway = await findInitOdds(HomeDrawAway);
  }
  let BothTeams = await db
    .collection("Market")
    .find({ eventId, name: { $regex: "Both Teams to Score", $options: "i" } })
    .toArray();

  if (BothTeams.length) {
    BothTeams = await findInitOdds(BothTeams);
  }
  let OverUnder = await db
    .collection("Market")
    .find({ eventId, name: { $regex: "Over/Under", $options: "i" } })
    .toArray();
  if (OverUnder.length) {
    OverUnder = await findInitOdds(OverUnder);
  }
  let HomeDrawAwayFirst = await db
    .collection("Market")
    .find({
      eventId,
      name: { $regex: "Home Draw Away, 1st Half", $options: "i" },
    })
    .toArray();
  if (HomeDrawAwayFirst.length) {
    HomeDrawAwayFirst = await findInitOdds(HomeDrawAwayFirst);
  }
  res.status(200).json({
    status: "success",

    data: {
      HomeDrawAway,
      BothTeams,
      OverUnder,
      HomeDrawAwayFirst,
    },
  });
});

exports.markets = catchAsync(async (req, res, next) => {
  const { nameString } = req.query;
  if (nameString) {
    req.query.nameString = undefined;
    req.query.name = { $regex: nameString, $options: "i" };
  }
  let markets = new ApiFeatures(db.collection("Market"), { ...req.query })
    .filter()
    .paginate()
    .sort();
  markets = await markets.query.toArray();
  const total = await db
    .collection("Market")
    .countDocuments(excludeFields({ ...req.query }));
  res.status(200).json({
    status: "success",
    total,
    result: markets.length,
    data: markets,
  });
});

exports.odds = catchAsync(async (req, res, next) => {
  const { marketId } = req.query;

  const marketOutcomeRelations = await db
    .collection("MarketOutcomeRelation")
    .find({ marketId })
    .toArray();
  const outcomeIds = marketOutcomeRelations.map((item) => item.outcomeId);

  const bettingOffer = await db
    .collection("BettingOffer")
    .find({ outcomeId: { $in: outcomeIds } })
    .toArray();
  res.status(200).json({
    status: "success",
    result: bettingOffer.length,
    data: bettingOffer,
  });
});
