const router = require("express").Router();
const adminCourseController = require("../controllers/adminCourseController");
const isAuth = require("../middlewares/isAuth");
const isCoach = require("../middlewares/isCoach");

router.get("/", isAuth, isCoach, adminCourseController.getCoachCourses);
router.post("/", isAuth, isCoach, adminCourseController.createCourse);
router.get("/:courseId", isAuth, isCoach, adminCourseController.getCourse);
router.put("/:courseId", isAuth, isCoach, adminCourseController.updateCourse);

module.exports = router;
