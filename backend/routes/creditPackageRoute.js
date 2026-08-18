const router = require("express").Router();
const creditPackageController = require("../controllers/creditPackageController");

router.get("/", creditPackageController.getCreditPackages);
router.post("/", creditPackageController.postCreditPackage);
router.delete("/:creditPackageId", creditPackageController.deleteCreditPackage);

module.exports = router;
