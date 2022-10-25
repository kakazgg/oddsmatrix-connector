const router = require("express").Router();
const globalController = require("../controllers/globalControllers");

router.route("/").get(globalController.global);
router.get("/events", globalController.events);

module.exports = router;
