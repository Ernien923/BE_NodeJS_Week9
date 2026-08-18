const { dataSource } = require("../db/data-source");
const { appErr } = require("../utils/appErr");
const { isStringValid, isInteger, isUUIDValid } = require("../utils/validate");

const creditPackageController = {
  // 1. 查詢購買方案列表
  getCreditPackages: async (req, res, next) => {
    const creditPackages = await dataSource
      .getRepository("CreditPackage")
      .find({
        select: { id: true, name: true, credit_amount: true, price: true },
        order: { created_at: "ASC" },
      });
    return res.status(200).json({ status: "success", data: creditPackages });
  },

  // 2. 新增購買方案
  postCreditPackage: async (req, res, next) => {
    const { name, credit_amount, price } = req.body;

    // 驗證方案名稱是否為空值、驗證堂數跟價格是否為整數
    if (
      !isStringValid(name) ||
      !isInteger(credit_amount) ||
      !isInteger(price)
    ) {
      return next(appErr(400, "欄位未填寫正確"));
    }

    // 檢查方案名稱是否重複
    const creditPackageRepo = await dataSource.getRepository("CreditPackage");
    const isExist = await creditPackageRepo.findOneBy({ name });
    if (isExist) {
      return next(appErr(409, "資料重複"));
    }

    // 方案包寫入資料表
    const creditPackageInsert = await creditPackageRepo.save({
      name,
      credit_amount,
      price,
    });
    res.status(201).json({ status: "success", data: creditPackageInsert });
  },

  // 3. 刪除購買方案
  deleteCreditPackage: async (req, res, next) => {
    try {
      const { creditPackageId } = req.params;

      // 檢驗 UUID 是否符合格式
      if (!isUUIDValid(creditPackageId)) {
        return next(appErr(400, "UUID不符合格式"));
      }

      // 刪除技能執行
      const creditPackageRepo = await dataSource.getRepository("CreditPackage");
      const result = await creditPackageRepo.delete(creditPackageId);
      if (result.affected === 0) {
        return next(appErr(400, "ID錯誤"));
      }
      return res.status(200).json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = creditPackageController;
