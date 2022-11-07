const router = require("express").Router();
const marketController = require("../controllers/marketControllers");

router.get("/odds", marketController.odds);
router.get("/init", marketController.initMarkets);
router.get("/", marketController.markets);

module.exports = router;
