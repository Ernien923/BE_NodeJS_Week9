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
      password: hashPassword,
      role: "USER",
    });
    res.status(201).json({
      status: "success",
      data: {
        user: {
          id: userSignUpInsert.id,
          name: userSignUpInsert.name,
          password: userSignUpInsert.password,
        },
      },
    });
  },

  // 2. 登入帳號
  postLogIn: async (req, res, next) => {
    const { email, password } = req.body;
    // 檢查帳號跟密碼是否為空
    if (!isStringValid(email) || !isStringValid(password)) {
      return next(appErr(400, "欄位未填寫正確"));
    }
    // 檢查密碼格式
    if (!isPasswordValid(password)) {
      return next(
        appErr(
          400,
          "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字",
        ),
      );
    }
    // 檢查帳號是否存在
    const userRepo = dataSource.getRepository("User");
    const user = await userRepo.findOneBy({ email });
    if (!user) {
      return next(appErr(400, "使用者不存在或密碼輸入錯誤"));
    }
    // 檢查密碼是否正確
    const hashPassword = user.password;
    const compareResult = await bcrypt.compare(password, hashPassword);
    if (!compareResult) {
      return next(appErr(400, "使用者不存在或密碼輸入錯誤"));
    }
    // token 簽發
    const secret = config.getConfig("secret.jwtSecret");
    const token = jwt.sign({ id: user.id, role: user.role }, secret, {
      expiresIn: config.getConfig("secret.jwtExpiresDay"),
    });
    return res
      .status(201)
      .json({ status: "success", data: { token, user: { name: user.name } } });
  },

  // 3. 取得個人資料
  getMember: async (req, res, next) => {
    res.json({
      status: "success",
      data: { user: { name: req.user.name, email: req.user.email } },
    });
  },

  // 4. 更新暱稱
  updateName: async (req, res, next) => {
    const { name } = req.body;
    // 驗證名稱格式
    if (!isStringValid(name)) {
      return next(appErr(400, "欄位未填寫正確"));
    }

    // 驗證新名稱是否相同
    if (req.user.name === name) {
      return next(appErr(400, "使用者名稱未變更"));
    }

    // 更新暱稱寫入資料表
    try {
      const userRepo = dataSource.getRepository("User");
      await userRepo.update({ id: req.user.id }, { name: name.trim() });
      const user = await userRepo.findOneBy({ id: req.user.id });
      res
        .status(200)
        .json({ status: "success", data: { user: { name: user.name } } });
    } catch (err) {
      return next(appErr(400, "更新使用者資料失敗"));
    }
  },

  // 5. 更改密碼
  updatePassword: async (req, res, next) => {
    const { password, new_password, confirm_new_password } = req.body;

    // 檢查自料是否為空值
    if (
      !isStringValid(password) ||
      !isStringValid(new_password) ||
      !isStringValid(confirm_new_password)
    ) {
      return next(appErr(400, "欄位未填寫正確"));
    }

    // 檢查密碼是否符合格式
    if (
      !isPasswordValid(password) ||
      !isPasswordValid(new_password) ||
      !isPasswordValid(confirm_new_password)
    ) {
      return next(
        appErr(
          400,
          "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字",
        ),
      );
    }

    // 檢查新舊密碼是否相同
    if (password === new_password) {
      return next(appErr(400, "新密碼不能與舊密碼相同"));
    }

    // 檢查新密碼與確認新密碼是否一致
    if (new_password !== confirm_new_password) {
      return next(appErr(400, "新密碼與驗證新密碼不一致"));
    }

    // 舊密碼比對
    const userRepo = dataSource.getRepository("User");
    const user = await userRepo.findOneBy({ id: req.user.id });
    const oldPasswordCompare = await bcrypt.compare(password, user.password);
    if (!oldPasswordCompare) {
      return next(appErr(400, "密碼輸入錯誤"));
    }

    // 更新密碼寫入資料表
    try {
      // 將新密碼做雜透
      const hashPassword = await bcrypt.hash(new_password, 10);

      await userRepo.update(
        { id: req.user.id },
        { password: hashPassword.trim() },
      );
    } catch (error) {}

    res.status(200).json({ status: "success", data: null });
  },
};

module.exports = userController;
