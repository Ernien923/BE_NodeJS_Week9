const jwt = require("jsonwebtoken");
const { dataSource } = require("../db/data-source");
const config = require("../config/getConfig");
const { appErr } = require("../utils/appErr");

const isAuth = async (req, res, next) => {
  try {
    // 從 header 取得 token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(appErr(401, "請先登入"));
    }
    const token = authHeader.split(" ")[1];

    // 驗證 token
    const decoded = jwt.verify(token, config.getConfig("secret.jwtSecret"));

    // 查詢 token 是否屬於本人
    const userRepo = dataSource.getRepository("User");
    const user = await userRepo.findOneBy({ id: decoded.id });
    if (!user) {
      return next(appErr(401, "無效的 token"));
    }

    // 將 token 掛到 req.user
    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(appErr(401, "Token 已過期"));
    }
    return next(appErr(401, "無效的 token"));
  }
};

module.exports = isAuth;
