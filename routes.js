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
  const { id, classroom_id, name, email, password } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO public."Student" ("Id", classroom_id, name, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, classroom_id, name, email, password]
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

// Get call the classrooms assigned to a teacher and the subjects assigned to each classroom
router.get("/classrooms/teacher/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const classrooms = await pool.query(
      'SELECT * FROM public."Classroom" WHERE "teacher_id" = $1',
      [id]
    );

    const classroomsWithSubjectsAndStudents = await Promise.all(
      classrooms.rows.map(async (classroom) => {
        const subjects = await pool.query(
          'SELECT s."Id", s.name FROM public."Subject" s INNER JOIN public."Classroom" c ON s.classroom_id = c."Id" WHERE c."Id" = $1',
          [classroom.Id]
        );

        const students = await pool.query(
          'SELECT st."Id" AS student_id, st.name FROM public."Student" st INNER JOIN public."Classroom" c ON st.classroom_id = c."Id" WHERE c."Id" = $1',
          [classroom.Id]
        );
        
        const grades = await pool.query(
          'SELECT g."Id", g.value, g.subject_id, g.student_id, st.name AS student_name, s.name AS subject_name FROM public."Grade" g INNER JOIN public."Student" st ON g.student_id = st."Id" INNER JOIN public."Subject" s ON g.subject_id = s."Id" WHERE s.classroom_id = $1',
          [classroom.Id]
        );

        students.rows = students.rows.map((student) => {
          const studentGrades = grades.rows.filter(
            (grade) => grade.student_name === student.name
          ).map((grade) => {
            return {
              subject_id: grade.subject_id,
              subject: grade.subject_name,
              grade: grade.value
            };
          });

          return {
            id: student.student_id,
            name: student.name,
            grades: studentGrades,
          };
        });

        return {
          ...classroom,
          subjects: subjects.rows,
          students: students.rows,
        };
      })
    );

    res.json(classroomsWithSubjectsAndStudents);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// A teacher assigns a grade to a student for a subject
router.post("/grade/:subject_id/:student_id", async (req, res) => {
  const { subject_id, student_id } = req.params;
  const { value, teacher_id } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO public."Grade" (value, subject_id, teacher_id, student_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [ value, subject_id, teacher_id, student_id ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Something went wrong" });
  }

});

// A teacher modifies a grade for a student for a subject
router.put("/grade/:subject_id/:student_id", async (req, res) => {
  const { subject_id, student_id } = req.params;
  const { value } = req.body;

  try {
    const result = await pool.query(
      'UPDATE public."Grade" SET value = $1 WHERE subject_id = $2 AND student_id = $3 RETURNING *',
      [ value, subject_id, student_id ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Something went wrong" });
  }

});


// Get subjects and grades for a student
router.get("/student/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const subjects = await pool.query(
      'SELECT s."Id", s.name FROM public."Subject" s INNER JOIN public."Classroom" c ON s.classroom_id = c."Id" INNER JOIN public."Student" st ON c."Id" = st.classroom_id WHERE st."Id" = $1',
      [id]
    );

    const grades = await pool.query(
      'SELECT g."Id", g.value, g.subject_id, g.student_id, st.name AS student_name FROM public."Grade" g INNER JOIN public."Student" st ON g.student_id = st."Id" INNER JOIN public."Subject" s ON g.subject_id = s."Id" WHERE st."Id" = $1',
      [id]
    );

    const studentGrades = subjects.rows.map((subject) => {
      const subjectGrades = grades.rows.filter(
        (grade) => grade.subject_id === subject.Id
      );

      return {
        id: subject.Id,
        name: subject.name,
        grades: subjectGrades,
      };
    });

    res.json(studentGrades);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
