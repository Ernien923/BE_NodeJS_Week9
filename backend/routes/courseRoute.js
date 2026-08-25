const router = require("express").Router();
const courseController = require("../controllers/courseController");
const isAuth = require("../middlewares/isAuth");

router.get("/", courseController.getAllCoursesInProcess);

// M5
router.post("/:courseId", isAuth, courseController.createBooking);
router.delete("/:courseId", isAuth, courseController.deleteCourse);

module.exports = router;
