const { dataSource } = require("../db/data-source");
const { appErr } = require("../utils/appErr");
const { isStringValid, isInteger, isUUIDValid } = require("../utils/validate");

const adminCoachController = {
  // 升級為教練
  setCoach: async (req, res, next) => {
    const { userId } = req.params;
    const { experience_years, description, profile_image_url } = req.body;

    // 檢查 UUID 是否符合格式
    if (!isUUIDValid(userId)) {
      return next(appErr(400, "UUID不符合格式"));
    }

    // 檢查資料格式
    if (!isStringValid(description) || !isInteger(experience_years)) {
      return next(appErr(400, "欄位未填寫正確"));
    }

    if (
      (profile_image_url !== undefined && !isStringValid(profile_image_url)) ||
      (profile_image_url && !profile_image_url.startsWith("https://"))
    ) {
      return next(appErr(400, "欄位未填寫正確"));
    }

    // 檢查使用者是否存在
    const userRepo = dataSource.getRepository("User");
    const user = await userRepo.findOneBy({ id: userId });
    if (!user) {
      return next(appErr(400, "使用者不存在"));
    }

    // 檢查是否已經為教練
    if (user.role === "COACH") {
      return next(appErr(409, "使用者已經是教練"));
    }

    // 更改身分
    await userRepo.update({ id: userId }, { role: "COACH" });

    // 將教練資訊寫入資料表
    const coachRepo = dataSource.getRepository("Coach");
    const coach = await coachRepo.save({
      user: { id: userId },
      experience: experience_years,
      description,
    });

    res.status(201).json({
      status: "success",
      data: {
        user: {
          name: user.name,
          role: "COACH",
        },
        coach: {
          id: coach.id,
          user_id: userId,
          experience_years: coach.experience,
          description: coach.description,
          profile_image_url: coach.profile_image_url,
          created_at: coach.created_at,
          updated_at: coach.updated_at,
        },
      },
    });
  },

  // 查看教練資料
  getCoach: async (req, res, next) => {
    const coachRepo = dataSource.getRepository("Coach");
    const coachLinkSkillRepo = dataSource.getRepository("CoachLinkSkill");

    const coach = await coachRepo.findOne({
      where: { user: { id: req.user.id } },
    });
    if (!coach) {
      return next(appErr(401, "使用者尚未成為教練"));
    }
    const link = await coachLinkSkillRepo.find({
      where: { coach: { id: coach.id } },
      relations: { skill: true },
    });

    res.status(200).json({
      status: "success",
      data: {
        id: coach.id,
        experience_years: coach.experience,
        description: coach.description,
        profile_image_url: coach.profile_image_url,
        skill_ids: link.map((skill) => skill.skill_id),
      },
    });
  },

  // // 更新教練資料
  updateCoach: async (req, res, next) => {
    const { experience_years, description, profile_image_url, skill_ids } =
      req.body;
    if (
      !isInteger(experience_years) ||
      !isStringValid(description) ||
      (profile_image_url !== undefined && !isStringValid(profile_image_url)) ||
      (profile_image_url && !profile_image_url.startsWith("https://")) ||
      skill_ids.length === 0
    ) {
      return next(appErr(400, "欄位未填寫正確"));
    }

    const coachRepo = dataSource.getRepository("Coach");
    const coachLinkSkillRepo = dataSource.getRepository("CoachLinkSkill");

    const coach = await coachRepo.findOne({
      where: { user_id: req.user.id },
    });
    if (!coach) {
      return next(appErr(401, "使用者尚未成為教練"));
    }

    await coachRepo.update(
      { id: coach.id },
      {
        experience: experience_years,
        description,
        profile_image_url,
      },
    );

    await coachLinkSkillRepo.delete({ coach_id: coach.id });
    for (const skill_id of skill_ids) {
      await coachLinkSkillRepo.save({ coach_id: coach.id, skill_id });
    }

    res.status(200).json({
      status: "success",
      data: {
        id: coach.id,
        experience_years,
        description: description.trim(),
        profile_image_url,
        skill_ids,
      },
    });
  },
};

module.exports = adminCoachController;
