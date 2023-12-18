const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");

const app = express();
const port = 3001;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "school-db",
  password: "warptenopro123",
  port: 5432,
});

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM public."Admin" WHERE email = $1',
      [email]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];

      const isPasswordCorrect = password === user.password;

      if (isPasswordCorrect) {
        const { password, ...rest } = user;
        res.json(rest);
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/students", async (req, res) => {
  const result = await pool.query('SELECT * FROM public."Student"');
  res.json(result.rows);
});

app.get("/teachers", async (req, res) => {
  const result = await pool.query('SELECT * FROM public."Teacher"');
  res.json(result.rows);
});

app.get("/courses", async (req, res) => {
  const result = await pool.query('SELECT * FROM public."Course"');
  res.json(result.rows);
});

app.post("/teacher", async (req, res) => {
  const { id, name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO public."Teacher" ("Id", name, email, password) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, name, email, hashedPassword]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/student", async (req, res) => {
  const { id, classroom_id, name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO public."Student" ("Id", classroom_id, name, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, classroom_id, name, email, hashedPassword]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
