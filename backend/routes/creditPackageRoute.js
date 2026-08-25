const router = require("express").Router();
const creditPackageController = require("../controllers/creditPackageController");
const isAuth = require("../middlewares/isAuth");

router.get("/", creditPackageController.getCreditPackages);
router.post("/", creditPackageController.postCreditPackage);
router.delete("/:creditPackageId", creditPackageController.deleteCreditPackage);

// M5
router.post("/:creditPackageId", isAuth, creditPackageController.purchase);

module.exports = router;
