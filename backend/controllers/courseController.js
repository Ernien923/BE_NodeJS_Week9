const { dataSource } = require("../db/data-source");
const { appErr } = require("../utils/appErr");
const { isStringValid, isInteger } = require("../utils/validate");

const courseController = {
  // 取得全站進行中課程資訊
  getAllCoursesInProcess: async (req, res, next) => {
    const now = new Date();
    const courseData = [];

    const courses = await dataSource.query(
      `select c.id,c.name,c.description,c.start_at,c.end_at,c.max_participants,u.name as coach_name,s.name as skill_name
from courses c
join coaches ch on c.coach_id = ch.id
join skills s on c.skill_id = s.id
join users u on ch.user_id = u.id
where c.start_at <= $1 and c.end_at > $1`,
      [now],
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

module.exports = courseController;
