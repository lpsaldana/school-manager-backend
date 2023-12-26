const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "school-db",
  password: "warptenopro123",
  port: 5432,
});

module.exports = pool;
