const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Course",
  tableName: "course",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    name: { type: "varchar", length: 100, nullable: false },
    description: { type: "text", nullable: true },
    start_at: { type: "timestamptz", nullable: false },
    end_at: { type: "timestamptz", nullable: false },
    max_participants: { type: "int", nullable: false },
  },
  relations: {
    coach: {
      type: "one-to-one",
      target: "Coach",
      joinColumn: { name: coach_id },
    },
    skill: {
      type: "one-to-one",
      target: "Skill",
      joinColumn: { name: skill_id },
    },
  },
});
