const { dataSource } = require("../db/data-source");
const { appErr } = require("../utils/appErr");
const { isStringValid, isUUIDValid } = require("../utils/validate");

const skillController = {
  // 1. 查詢技能
  getSkills: async (req, res, next) => {
    const skills = await dataSource.getRepository("Skill").find({
      select: { id: true, name: true },
      order: { created_at: "ASC" },
    });
    return res.status(200).json({ status: "success", data: skills });
  },

  // 2. 新增技能
  postSkill: async (req, res, next) => {
    const { name } = req.body;

    // 檢驗名稱是否為空值或含空白
    if (!isStringValid(name)) {
      return next(appErr(400, "欄位未填寫正確"));
    }
    // 檢驗是否名稱重複
    const skillRepo = await dataSource.getRepository("Skill");
    const isExist = await skillRepo.findOneBy({ name });
    if (isExist) {
      return next(appErr(409, "資料重複"));
    }

    // 教練新增技能寫入資料表
    const skillInsert = await skillRepo.save({ name });
    res.status(201).json({ status: "success", data: skillInsert });
  },

  // 3. 刪除技能
  deleteSkill: async (req, res, next) => {
    try {
      const { skillId } = req.params;

      // 檢驗 UUID 是否符合格式
      if (!isUUIDValid(skillId)) {
        return next(appErr(400, "UUID不符合格式"));
      }

      // 刪除技能執行
      const skillRepo = await dataSource.getRepository("Skill");
      const result = await skillRepo.delete(skillId);
      if (result.affected === 0) {
        return next(appErr(400, "ID錯誤"));
      }
      return res.status(200).json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = skillController;
