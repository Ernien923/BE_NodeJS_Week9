const router = require("express").Router();
const coachController = require("../controllers/coachController");

router.get("/", coachController.getAllCoaches);
router.get("/:coachId", coachController.getOneCoach);
router.get("/:coachId/courses", coachController.getCoachCourseInProcess);

module.exports = router;
