const router = require("express").Router();
const globalController = require("../controllers/globalControllers");

router.route("/").get(globalController.global);
router.get("/events", globalController.events2);
router.get("/sports", globalController.sports);
router.get("/leagues", globalController.leagues);

module.exports = router;
