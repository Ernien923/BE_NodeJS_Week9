const router = require("express").Router();
const userController = require("../controllers/userController");

router.post("/", userController.postSignUp);
// router.post("/", creditPackageController.postCreditPackage);
// router.delete("/:creditPackageId", creditPackageController.deleteCreditPackage);

module.exports = router;
