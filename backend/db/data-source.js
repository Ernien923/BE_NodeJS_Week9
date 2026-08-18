const { DataSource } = require("typeorm");
const config = require("../config/getConfig");

// entities 匯入
const User = require("../entities/User");
const Coach = require("../entities/Coach");
const Skill = require("../entities/Skill");
const CreditPackage = require("../entities/CreditPackage");

const dataSource = new DataSource({
  type: "postgres",
  host: config.getConfig("db.host"),
  port: Number(config.getConfig("db.port")),
  username: config.getConfig("db.username"),
  password: config.getConfig("db.password"),
  database: config.getConfig("db.database"),
  synchronize: config.getConfig("db.synchronize"),
  ssl: config.getConfig("db.ssl"),
  entities: [User, Coach, Skill, CreditPackage],
});

module.exports = { dataSource };
