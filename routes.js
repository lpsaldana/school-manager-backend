const express = require("express");
const pool = require("./db");

const router = express.Router();

// login routes
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query(
            'SELECT * FROM public."User" WHERE email = $1',
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

// teacher routes
//get all teachers
router.get("/teachers", async (req, res) => {
    const result = await pool.query('SELECT * FROM public."Teacher"');
    res.json(result.rows);
});

//get teacher by id
router.get("/teachers/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM public."Teacher" WHERE "Id" = $1',
            [id]
            );

        if (result.rows.length) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: "Teacher not found" });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Something went wrong" });
    }
});

//create teacher
router.post("/teacher", async (req, res) => {
    const { id, name, email, password } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO public."Teacher" ("Id", name, email, password) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, name, email, password]
            );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Something went wrong" });
    }
});

// student routes
//get all students
router.get("/students", async (req, res) => {
    const result = await pool.query('SELECT * FROM public."Student"');
    res.json(result.rows);
});

//get student by id
router.get("/students/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM public."Student" WHERE "Id" = $1',
            [id]
            );

        if (result.rows.length) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: "Student not found" });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Something went wrong" });
    }
});

//create student
router.post("/student", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO public."Student" (name, email, password) VALUES ($1, $2, $3) RETURNING *',
            [name, email, password]
            );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Something went wrong" });
    }
});

// subject routes
//get all subjects
router.get("/subjects", async (req, res) => {
    const result = await pool.query('SELECT * FROM public."Subject"');
    res.json(result.rows);
});

//get subject by id
router.get("/subjects/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM public."Subject" WHERE "Id" = $1',
            [id]
            );

        if (result.rows.length) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: "Subject not found" });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Something went wrong" });
    }
});

//create subject
router.post("/subject", async (req, res) => {
    const { id, name, classroom_id } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO public."Subject" ("Id", name, classroom_id) VALUES ($1, $2, $3) RETURNING *',
            [id, name, classroom_id]
            );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Something went wrong" });
    }
});

// classroom routes
//get all classrooms
router.get("/classrooms", async (req, res) => {
    const result = await pool.query('SELECT * FROM public."Classroom"');
    res.json(result.rows);
});

//get classroom by id
router.get("/classrooms/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM public."Classroom" WHERE "Id" = $1',
            [id]
            );

        if (result.rows.length) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: "Classroom not found" });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Something went wrong" });
    }
});

//create classroom
router.post("/classroom", async (req, res) => {
    const { id, name, teacher_id } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO public."Classroom" ("Id", name, teacher_id) VALUES ($1, $2, $3) RETURNING *',
            [id, name, teacher_id]
            );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Something went wrong" });
    }
});

module.exports = router;