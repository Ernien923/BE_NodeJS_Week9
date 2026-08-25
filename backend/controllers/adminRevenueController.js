const { dataSource } = require("../db/data-source");
const { appErr } = require("../utils/appErr");
const { isStringValid } = require("../utils/validate");

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

const adminRevenueController = {
  getCoachRevenue: async (req, res, next) => {
    const { month } = req.query;
    // 檢查資料格式
    if (!isStringValid(month) || !MONTHS.includes(month)) {
      return next(appErr(400, "欄位未填寫正確"));
    }

    // 取得教練開的所有課程
    const coachRepo = dataSource.getRepository("Coach");
    const coach = await coachRepo.findOneBy({
      user_id: req.user.id,
    });
    const courseRepo = dataSource.getRepository("Course");
    const courses = await courseRepo.find({
      where: { coach_id: coach.id },
      relations: { coach: { user: true } },
    });

    // 未開設任何課程
    if (courses.length === 0) {
      return res.status(200).json({
        status: "success",
        data: {
          total: {
            revenue: 0,
            participants: 0,
            course_count: 0,
          },
        },
      });
    }

    // 該月的時間區間（年份固定為伺服器當年）
    const monthIndex = MONTHS.indexOf(month);
    const year = new Date().getFullYear();
    const startAt = new Date(year, monthIndex, 1);
    const endAt = new Date(year, monthIndex + 1, 1);

    const bookings = await dataSource.query(
      `select cb.user_id
   from course_bookings cb
   join courses c on cb.course_id = c.id
   where c.coach_id = $1
     and cb.cancelled_at is null
     and cb.created_at >= $2
     and cb.created_at < $3`,
      [coach.id, startAt, endAt],
    );

    const courseCount = bookings.length;
    const participants = new Set(bookings.map((b) => b.user_id)).size;

    // 單堂均價 = 全部方案的 Σprice ÷ Σcredit_amount
    const packageRepo = dataSource.getRepository("CreditPackage");
    const packages = await packageRepo.find();

    const totalPrice = packages.reduce((sum, p) => sum + Number(p.price), 0);
    const totalCredits = packages.reduce(
      (sum, p) => sum + Number(p.credit_amount),
      0,
    );
    const pricePerCredit = totalCredits === 0 ? 0 : totalPrice / totalCredits;

    // 先乘再無條件捨去
    const revenue = Math.floor(courseCount * pricePerCredit);
    res.status(200).json({
      status: "success",
      data: {
        total: {
          revenue,
          participants,
          course_count: courseCount,
        },
      },
    });
  },
};

module.exports = adminRevenueController;
