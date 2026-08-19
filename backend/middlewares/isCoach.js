const { appErr } = require("../utils/appErr");

const isCoach = (req, res, next) => {
  if (!req.user || req.user.role !== "COACH") {
    return next(appErr(401, "使用者尚未成為教練"));
  }
  next();
};
module.exports = isCoach;
