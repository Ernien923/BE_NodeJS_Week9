const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "CreditPackage",
  tableName: "creditpackage",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    name: { type: "varchar", length: 100, nullable: false, unique: true },
    description: { type: "text", nullable: true },
    price: { type: "integer", nullable: false },
    credit_amount: { type: "integer", nullable: false },
    created_at: { type: "timestamptz", createDate: true },
  },
});
