// /api/dashboard/admin/route.js
import { createConnection } from "@/lib/db.js";
import { NextResponse } from "next/server";
import dotenv from "dotenv";

dotenv.config();

export async function GET(req, context) {
  try {
    const db = await createConnection("project");

    // Fetch Courses
    const [courses] = await db.query(`
      SELECT DISTINCT courseID, name, code, description
      FROM Courses
    `);

    // Fetch Instructors
    const [instructors] = await db.query(`
      SELECT instructorID, firstName, lastName, email
      FROM Instructors
    `);

    // **Fetch Students**
    const [students] = await db.query(`
      SELECT studentID, firstName, lastName, email
      FROM Students
    `);

        // In the GET handler
    const [sections] = await db.query(`
      SELECT s.sectionID, s.section, s.courseID, c.name AS courseName
      FROM Sections s
      JOIN Courses c ON s.courseID = c.courseID
    `);
    return NextResponse.json(
      { courses, instructors, students, sections },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data." },
      { status: 500 }
    );
  }
}

export async function POST(req, context) {
  try {
    const db = await createConnection("project");
    const { action, data } = await req.json();

    if (!action || !data) {
      return NextResponse.json(
        { error: "Action and data are required." },
        { status: 400 }
      );
    }

    switch (action) {
      case "addCourse":
        return await addCourse(db, data);
      case "assignSections":
        return await assignSections(db, data);
      case "addStudent":
        return await addStudent(db, data);
      case "addInstructor":
        return await addInstructor(db, data);
      case "assignStudent":
        return await assignStudent(db, data); // Add this case
      default:
        return NextResponse.json(
          { error: "Invalid action." },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error processing POST request:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// Handler to add a new course
async function addCourse(db, data) {
  const { courseName, courseCode, description } = data;

  // Validation
  if (!courseName || !courseCode || !description) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 }
    );
  }

  try {
    const insertSql = `
      INSERT INTO Courses (name, code, description)
      VALUES (?, ?, ?)
    `;
    const [result] = await db.query(insertSql, [
      courseName,
      courseCode,
      description,
    ]);

    return NextResponse.json(
      { message: "Course added successfully.", courseID: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding course:", error);
    return NextResponse.json(
      { error: "Failed to add course." },
      { status: 500 }
    );
  }
}

// Handler to assign sections and instructors
async function assignSections(db, data) {
  const { courseID, section, instructorID } = data;

  // Validation
  if (!courseID || !section || !instructorID) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 }
    );
  }

  try {
    // Check if course exists
    const [course] = await db.query(
      "SELECT * FROM Courses WHERE courseID = ?",
      [courseID]
    );
    if (course.length === 0) {
      return NextResponse.json(
        { error: "Course not found." },
        { status: 404 }
      );
    }

    // Check if instructor exists
    const [instructor] = await db.query(
      "SELECT * FROM Instructors WHERE instructorID = ?",
      [instructorID]
    );
    if (instructor.length === 0) {
      return NextResponse.json(
        { error: "Instructor not found." },
        { status: 404 }
      );
    }

    const insertSql = `
      INSERT INTO Sections (section, courseID, instructorID)
      VALUES (?, ?, ?)
    `;
    const [result] = await db.query(insertSql, [
      section,
      courseID,
      instructorID,
    ]);

    return NextResponse.json(
      {
        message: "Section assigned successfully.",
        sectionID: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error assigning sections:", error);
    return NextResponse.json(
      { error: "Failed to assign sections." },
      { status: 500 }
    );
  }
}

async function assignStudent(db, data) {
  const { studentID, courseID, sectionID } = data;

  // Validation
  if (!studentID || !courseID || !sectionID) {
    return NextResponse.json(
      { error: "Student, Course, and Section are required." },
      { status: 400 }
    );
  }

  try {
    // Assign student to the course and section
    const sql = `
      INSERT INTO Enrollments (studentID, courseID, sectionID)
      VALUES (?, ?, ?)
    `;
    await db.query(sql, [studentID, courseID, sectionID]);

    return NextResponse.json(
      { message: "Student assigned to course and section successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error assigning student:", error);
    return NextResponse.json(
      { error: "Failed to assign student to course and section." },
      { status: 500 }
    );
  }
}

// Handler to add a new student
async function addStudent(db, data) {
  const { firstName, lastName, email, bio, username, password } = data;

  // Validation
  if (!firstName || !lastName || !email || !bio || !username || !password) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 }
    );
  }

  try {
    // Start transaction
    await db.beginTransaction();

    // Insert into Accounts table
    const accountSql = `
      INSERT INTO Accounts (identifierID, username, password, usertype)
      VALUES (?, ?, ?, ?)
    `;
    await db.query(accountSql, [email, username, password, 3]); // usertype 3 for student

    // Insert into Students table
    const studentSql = `
      INSERT INTO Students (firstName, lastName, email, bio)
      VALUES (?, ?, ?, ?)
    `;
    await db.query(studentSql, [firstName, lastName, email, bio]);

    // Commit transaction
    await db.commit();

    return NextResponse.json(
      { message: "Student added successfully." },
      { status: 201 }
    );
  } catch (error) {
    // Rollback transaction on error
    await db.rollback();
    console.error("Error adding student:", error);
    return NextResponse.json(
      { error: "Failed to add student." },
      { status: 500 }
    );
  }
}

// Handler to add a new instructor
async function addInstructor(db, data) {
  const { firstName, lastName, email, username, password } = data;

  // Validation
  if (!firstName || !lastName || !email || !username || !password) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 }
    );
  }

  try {
    // Start transaction
    await db.beginTransaction();

    // Insert into Accounts table
    const accountSql = `
      INSERT INTO Accounts (identifierID, username, password, usertype)
      VALUES (?, ?, ?, ?)
    `;
    await db.query(accountSql, [email, username, password, 2]); // usertype 2 for instructor

    // Insert into Instructors table
    const instructorSql = `
      INSERT INTO Instructors (firstName, lastName, email)
      VALUES (?, ?, ?)
    `;
    await db.query(instructorSql, [firstName, lastName, email]);

    // Commit transaction
    await db.commit();

    return NextResponse.json(
      { message: "Instructor added successfully." },
      { status: 201 }
    );
  } catch (error) {
    // Rollback transaction on error
    await db.rollback();
    console.error("Error adding instructor:", error);
    return NextResponse.json(
      { error: "Failed to add instructor." },
      { status: 500 }
    );
  }
}