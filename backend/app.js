const config = require("./config/getConfig");
const express = require("express");
const cors = require("cors");
const { dataSource } = require("./db/data-source");

const app = express();

app.use(cors());
app.use(express.json());

// M0
app.get("/healthcheck", (req, res) => {
  res.status(200).send("OK");
});

// M1
app.use("/api/coaches/skill", require("./routes/skillRoute"));
app.use("/api/credit-package", require("./routes/creditPackageRoute"));

// M2
app.use("/api/users", require("./routes/userRoute"));

// M3
app.use("/api/admin/coaches/courses", require("./routes/adminCourseRoute"));
app.use("/api/admin/coaches", require("./routes/adminCoachRoute"));

// M4
app.use("/api/coaches", require("./routes/coacheRoute"));
app.use("/api/courses", require("./routes/courseRoute"));

// 404 路由
app.use((req, res) => {
  res.status(404).json({ status: "failed", message: "無此路由" });
});

app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    status: statusCode === 500 ? "error" : "failed",
    message: err.message || "伺服器錯誤",
  });
});

// 啟動
dataSource
  .initialize()
  .then(() => {
    app.listen(config.getConfig("web.port"), () => {
      console.log(`Server is running on port ${config.getConfig("web.port")}`);
    });
  })
  .catch((err) => {
    console.error(`連線失敗 ${err.message}`);
    process.exit(1);
  });
