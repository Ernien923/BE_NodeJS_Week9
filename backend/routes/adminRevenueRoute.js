const router = require("express").Router();
const adminRevenueController = require("../controllers/adminRevenueController");
const isAuth = require("../middlewares/isAuth");
const isCoach = require("../middlewares/isCoach");

// M6
router.get("/", isAuth, isCoach, adminRevenueController.getCoachRevenue);

module.exports = router;
