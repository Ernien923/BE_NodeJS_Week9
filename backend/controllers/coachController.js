const { dataSource } = require("../db/data-source");
const { appErr } = require("../utils/appErr");
const { isStringValid, isInteger } = require("../utils/validate");

const coachController = {
  // 取得教練列表
  getAllCoaches: async (req, res, next) => {
    const { per, page } = req.query;
    // 檢查資料格式
    if (!isStringValid(per) || !isStringValid(page)) {
      return next(appErr(400, "欄位未填寫正確"));
    }

    const coachRepo = dataSource.getRepository("Coach");
    const coachData = [];
    const coach = await coachRepo.find({
      select: { id: true, user_id: true, user: { name: true } },
      relations: { user: true },
    });

    for (const c of coach) {
      coachData.push({
        id: c.id,
        user_id: c.user_id,
        name: c.user.name,
      });
    }
    res.status(200).json({ status: "success", data: coachData });
  },

  // 取得單一教練資料
  getOneCoach: async (req, res, next) => {
    const { coachId } = req.params;
    // 查詢資料是否為空
    if (!isStringValid(coachId)) {
      return next(appErr(400, "欄位未填寫正確"));
    }

    const coachRepo = dataSource.getRepository("Coach");
    const coachLinkSkillRepo = dataSource.getRepository("CoachLinkSkill");
    const coach = await coachRepo.findOne({
      where: { id: coachId },
      select: {
        id: true,
        user_id: true,
        user: { name: true, role: true },
        experience: true,
        description: true,
        profile_image_url: true,
        created_at: true,
        updated_at: true,
      },
      relations: { user: true },
    });
    if (!coach) {
      return next(appErr(400, "查無此教練"));
    }

    const link = await coachLinkSkillRepo.find({
      where: { coach_id: coachId },
      relations: { skill: true },
    });

    res.status(200).json({
      status: "success",
      data: {
        user: {
          name: coach.user.name,
          role: coach.user.role,
        },
        coach: {
          id: coach.id,
          user_id: coach.user_id,
          experience_years: coach.experience,
          description: coach.description,
          profile_image_url: coach.profile_image_url,
          created_at: coach.created_at,
          updated_at: coach.updated_at,
          skills: link.map((l) => l.skill.name),
        },
      },
    });
  },

  // 取得指定教練未結束課程
  getCoachCourseInProcess: async (req, res, next) => {
    const { coachId } = req.params;
    const now = new Date();
    const courseData = [];
    const coachRepo = dataSource.getRepository("Coach");
    const coach = await coachRepo.findOneBy({ id: coachId });
    if (!coach) {
      return next(appErr(400, "查無該教練"));
    }

    const courses = await dataSource.query(
      `select c.id,c.name,c.description,c.start_at,c.end_at,c.max_participants,u.name as coach_name,s.name as skill_name
from courses c
join coaches ch on c.coach_id = ch.id
join skills s on c.skill_id = s.id
join users u on ch.user_id = u.id
where c.end_at > $1 and ch.id = $2`,
      [now, coachId],
    );

    for (const c of courses) {
      courseData.push(c);
    }
    res.status(200).json({
      status: "success",
      data: courseData,
    });
  },
};

module.exports = coachController;
