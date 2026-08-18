const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/getConfig");
const { dataSource } = require("../db/data-source");
const { appErr } = require("../utils/appErr");
const {
  isStringValid,
  isPasswordValid,
  isUUIDValid,
} = require("../utils/validate");

const userController = {
  // 1. 註冊帳號
  postSignUp: async (req, res, next) => {
    // 驗證資料是否為空
    const { name, email, password } = req.body;
    if (
      !isStringValid(name) ||
      !isStringValid(email) ||
      !isStringValid(password)
    ) {
      return next(appErr(400, "欄位未填寫正確"));
    }

    // 驗證密碼格式
    if (!isPasswordValid(password)) {
      return next(
        appErr(
          400,
          "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字",
        ),
      );
    }

    // 驗證信箱是否已經註冊過
    const userRepo = await dataSource.getRepository("User");
    const isExist = await userRepo.findOneBy({ email });
    if (isExist) {
      return next(appErr(409, "Email 已被使用"));
    }

    // 密碼做雜湊
    const hashPassword = await bcrypt.hash(password, 10);

    // email 轉小寫
    const emailSave = email.trim().toLowerCase();

    // name 去除空白
    const nameSave = name.trim();

    // 註冊資訊寫入資料表
    const userSignUpInsert = await userRepo.save({
      name: nameSave,
      email: emailSave,
      old_password: hashPassword,
      role: "USER",
    });
    res.status(201).json({
      status: "success",
      data: {
        user: { id: userSignUpInsert.id, name: userSignUpInsert.name },
      },
    });
  },
  // 3. 取得個人資料
  getMember: async (req, res, next) => {},
};

module.exports = userController;
