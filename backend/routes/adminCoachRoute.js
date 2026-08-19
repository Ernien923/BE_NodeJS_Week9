const router = require("express").Router();
const adminCoachController = require("../controllers/adminCoachController");
const isAuth = require("../middlewares/isAuth");
const isCoach = require("../middlewares/isCoach");

router.post("/:userId", adminCoachController.setCoach);
router.get("/", isAuth, isCoach, adminCoachController.getCoach);
// router.put("/", isAuth, isCoach, adminCoachController.updateCoach);

module.exports = router;
