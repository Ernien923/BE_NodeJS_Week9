const { IsNull } = require("typeorm");
const { dataSource } = require("../db/data-source");
const { appErr } = require("../utils/appErr");
const { isStringValid, isInteger, isUUIDValid } = require("../utils/validate");

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

  // 報名課程
  createBooking: async (req, res, next) => {
    const { courseId } = req.params;

    // 檢驗 UUID 是否符合格式
    if (!isUUIDValid(courseId)) {
      return next(appErr(400, "UUID不符合格式"));
    }

    // 檢查課程是否存在
    const courseRepo = dataSource.getRepository("Course");
    const course = await courseRepo.findOneBy({ id: courseId });
    if (!course) {
      return next(appErr(400, "ID錯誤"));
    }

    // 檢查是否報名過課程
    const bookingRepo = dataSource.getRepository("CourseBooking");
    const isbookingExist = await bookingRepo.findOneBy({
      user_id: req.user.id,
      course_id: courseId,
    });

    if (isbookingExist) {
      return next(appErr(400, "已經報名過此課程"));
    }

    // 檢查剩餘堂數
    const purchaseRepo = dataSource.getRepository("CreditPurchase");
    const purchase = await purchaseRepo.find({
      where: { user_id: req.user.id },
    });

    const totalCredits = purchase.reduce(
      (sum, pur) => sum + pur.purchased_credits,
      0,
    );

    const usageCount = await bookingRepo.count({
      where: { user_id: req.user.id, cancelled_at: IsNull() },
    });

    if (totalCredits - usageCount <= 0) {
      return next(appErr(400, "已無可使用堂數"));
    }

    // 檢查是否已經額滿
    const participantCount = await bookingRepo.count({
      where: { course_id: courseId, cancelled_at: IsNull() },
    });

    if (participantCount >= course.max_participants) {
      return next(appErr(400, "已達最大參加人數，無法參加"));
    }

    // 驗證通過，寫入報名資料表
    await bookingRepo.save({
      user_id: req.user.id,
      course_id: courseId,
    });

    res.status(201).json({ status: "success", data: null });
  },

  // 取消報名課程
  deleteCourse: async (req, res, next) => {
    const { courseId } = req.params;

    // 檢驗 UUID 是否符合格式
    if (!isUUIDValid(courseId)) {
      return next(appErr(400, "UUID不符合格式"));
    }

    // 檢查是否有報名紀錄
    const bookingRepo = dataSource.getRepository("CourseBooking");
    const booking = await bookingRepo.findOneBy({
      user_id: req.user.id,
      course_id: courseId,
      cancelled_at: IsNull(),
    });

    if (!booking) {
      return next(appErr(400, "ID錯誤"));
    }

    // 軟刪除 更新欄位
    booking.cancelled_at = new Date();

    // 寫入資料表
    await bookingRepo.save(booking);
    res.status(200).json({ status: "success", data: null });
  },
};

module.exports = courseController;
