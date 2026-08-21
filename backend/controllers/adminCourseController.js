const { dataSource } = require("../db/data-source");
const { appErr } = require("../utils/appErr");
const { isStringValid, isInteger } = require("../utils/validate");
const { IsNull } = require("typeorm");

const adminCourseController = {
  // 查看教練開設課程
  getCoachCourses: async (req, res, next) => {
    const courseRepo = dataSource.getRepository("Course");
    const coachRepo = dataSource.getRepository("Coach");
    const bookingRepo = dataSource.getRepository("CourseBooking");

    const now = new Date();
    let status = "";
    const courseData = [];

    const user = await coachRepo.findOne({
      select: { id: true },
      where: { user_id: req.user.id },
    });

    const courses = await courseRepo.find({
      where: { coach_id: user.id },
      order: { start_at: "ASC" },
    });

    for (const c of courses) {
      const count = await bookingRepo.count({
        where: { course_id: c.id, cancelled_at: IsNull() },
      });

      if (c.start_at > now) status = "尚未開始";
      else if (c.end_at <= now) status = "已結束";
      else status = "進行中";
      courseData.push({
        id: c.id,
        name: c.name,
        status,
        start_at: c.start_at,
        end_at: c.end_at,
        max_participants: c.max_participants,
        meeting_url: c.meeting_url,
        participants: count,
      });
    }
    res.status(200).json({ status: "success", data: courseData });
  },

  // 教練新開課程
  createCourse: async (req, res, next) => {
    const {
      skill_id,
      name,
      description,
      start_at,
      end_at,
      max_participants,
      meeting_url,
    } = req.body;
    if (
      !skill_id ||
      !isStringValid(name) ||
      !isStringValid(description) ||
      !isStringValid(start_at) ||
      !isStringValid(end_at) ||
      !isInteger(max_participants) ||
      (meeting_url !== undefined && !isStringValid(meeting_url)) ||
      (meeting_url && !meeting_url.startsWith("https://"))
    ) {
      return next(appErr(400, "欄位未填寫正確"));
    }

    const coachRepo = dataSource.getRepository("Coach");
    const courseRepo = dataSource.getRepository("Course");

    const coach = await coachRepo.findOne({
      where: { user_id: req.user.id },
    });
    if (!coach) {
      return next(appErr(400, "使用者尚未成為教練"));
    }

    const user = await coachRepo.findOne({
      select: { id: true, user_id: true },
      where: { user_id: req.user.id },
    });

    // 因為 courses 表格有設定 coach_id，所以改寫成需要寫入 coach_id
    const course = await courseRepo.save({
      user_id: user.user_id,
      coach_id: user.id,
      skill_id,
      name,
      description,
      start_at,
      end_at,
      max_participants,
      meeting_url,
    });

    const { coach_id, ...courseData } = course;

    res.status(200).json({
      status: "success",
      data: {
        course: courseData,
      },
    });
  },

  // 取得單一課程資訊
  getCourse: async (req, res, next) => {
    const { courseId } = req.params;
    // 檢查是否為教練本人開的課程
    const coachRepo = dataSource.getRepository("Coach");
    const user = await coachRepo.findOne({
      select: { id: true, user_id: true },
      where: { user_id: req.user.id },
    });
    const courseRepo = dataSource.getRepository("Course");

    const course = await courseRepo.findOne({
      where: { id: courseId, coach_id: user.id },
    });
    if (!course) {
      return next(appErr(400, "課程不存在"));
    }
    res.status(200).json({ status: "success", data: course });
  },

  // 教練更新單一課程資訊
  updateCourse: async (req, res, next) => {
    const { courseId } = req.params;
    const {
      skill_id,
      name,
      description,
      start_at,
      end_at,
      max_participants,
      meeting_url,
    } = req.body;

    // 驗證資料格式
    if (
      !skill_id ||
      !isStringValid(name) ||
      !isStringValid(description) ||
      !isStringValid(start_at) ||
      !isStringValid(end_at) ||
      !isInteger(max_participants) ||
      (meeting_url !== undefined && !isStringValid(meeting_url)) ||
      (meeting_url && !meeting_url.startsWith("https://"))
    ) {
      return next(appErr(400, "欄位未填寫正確"));
    }
    const courseRepo = dataSource.getRepository("Course");
    const coachRepo = dataSource.getRepository("Coach");

    const user = await coachRepo.findOne({
      select: { id: true, user_id: true },
      where: { user_id: req.user.id },
    });

    const course = await courseRepo.findOne({
      where: { id: courseId, coach_id: user.id },
    });
    if (!course) {
      return next(appErr(400, "課程不存在"));
    }

    // 更新課程資料，寫入資料表
    const newCourse = await courseRepo.update(
      { id: courseId },
      {
        coach_id: user.id,
        skill_id,
        name,
        description,
        start_at,
        end_at,
        max_participants,
        meeting_url,
      },
    );
    const { coach_id, ...courseData } = newCourse;

    res.status(200).json({ status: "success", data: { course: courseData } });
  },
};

module.exports = adminCourseController;
