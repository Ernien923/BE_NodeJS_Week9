const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    name: { type: "varchar", length: 50, nullable: false },
    email: { type: "varchar", length: 200, nullable: false, unique: true },
    role: { type: "varchar", length: 50, nullable: false },
    old_password: { type: "varchar", length: 255, nullable: false },
    new_password: { type: "varchar", length: 255, nullable: true },
    created_at: { type: "timestamptz", createDate: true },
    updated_at: { type: "timestamptz", updateDate: true },
  },
});
