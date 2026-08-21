const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Coach",
  tableName: "coaches",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    user_id: { type: "uuid", nullable: false, unique: true },
    experience: { type: "integer", nullable: false, default: 0 },
    description: { type: "text", nullable: true },
    profile_image_url: { type: "varchar", length: 500, nullable: true },
    created_at: { type: "timestamptz", createDate: true },
    updated_at: { type: "timestamptz", updateDate: true },
  },
  relations: {
    user: {
      type: "one-to-one",
      target: "User",
      joinColumn: { name: "user_id" },
    },
  },
});
