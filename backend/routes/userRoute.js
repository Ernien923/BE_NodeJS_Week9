const router = require("express").Router();
const userController = require("../controllers/userController");
const isAuth = require("../middlewares/isAuth");

router.post("/signup", userController.postSignUp);
router.post("/login", userController.postLogIn);
router.get("/profile", isAuth, userController.getMember);
router.put("/profile", isAuth, userController.updateName);
router.put("/password", isAuth, userController.updatePassword);

// M5
router.get("/credit-package", isAuth, userController.getPurchases);
router.get("/courses", isAuth, userController.getCourses);
module.exports = router;
