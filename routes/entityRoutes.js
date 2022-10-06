const router = require("express").Router();
const entityControllers = require("../controllers/entityControllers");

router.route("/").get(entityControllers.getEntities);

module.exports = router;
