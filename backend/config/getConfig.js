require("dotenv").config();
const db = require("./db");
const secret = require("./secret");
const web = require("./web");

const config = { db, secret, web };

function getConfig(path) {
  const keys = path.split(".");
  return config[keys[0]][keys[1]] !== undefined
    ? config[keys[0]][keys[1]]
    : `Config path not found: ${path}`;
}

module.exports = { getConfig };
