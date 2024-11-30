// /api/dashboard/admin/route.js
import { createConnection } from "@/lib/db.js";
import { NextResponse } from "next/server";
import dotenv from "dotenv";

dotenv.config();

export async function GET(req, context) {
  try {
    // Establish a database connection
    const db = await createConnection("project");

    // SQL query to fetch courses with their sections and instructors
    const sql = `
      SELECT 
        Courses.courseID AS courseID,
        Courses.code AS courseCode,
        Courses.name AS courseName,
        Sections.sectionID AS sectionID,
        Sections.section AS sectionName,
        Instructors.instructorID AS instructorID,
        CONCAT(Instructors.firstName, ' ', Instructors.lastName) AS instructorName,
        Instructors.email AS instructorEmail
      FROM 
        Courses
      JOIN 
        Sections ON Courses.courseID = Sections.courseID
      JOIN 
        Instructors ON Sections.instructorID = Instructors.instructorID
      ORDER BY 
        Courses.courseID, Sections.sectionID
    `;

    // Query the database
    const [courseDetails] = await db.query(sql);

    // Handle empty results
    if (courseDetails.length === 0) {
      return NextResponse.json(
        { message: "No courses found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ courses: courseDetails }, { status: 200 });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses." },
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
  if (!courseName || ! courseCode || !description) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 }
    );
  }

  try {
    const insertSql = `
      INSERT INTO Courses (code, name, description)
      VALUES (?, ?, ?)
    `;
    const [result] = await db.query(insertSql, [courseCode, courseName, description]);

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
  const { courseID, sectionName, instructorID } = data;

  // Validation
  if (!courseID || !sectionName || !instructorID) {
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
    const [result] = await db.query(insertSql, [sectionName, courseID, instructorID]);

    return NextResponse.json(
      { message: "Section assigned successfully.", sectionID: result.insertId },
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

// Handler to add a new student
async function addStudent(db, data) {
  const { firstName, lastName, email, bio, birthday } = data;

  // Validation
  if (!firstName || !lastName || !email || !bio || !birthday) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 }
    );
  }

  try {
    const insertSql = `
      INSERT INTO Students (firstName, lastName, email, bio, birthday)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(insertSql, [
      firstName,
      lastName,
      email,
      bio,
      birthday,
    ]);

    return NextResponse.json(
      { message: "Student added successfully.", studentID: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding student:", error);
    return NextResponse.json(
      { error: "Failed to add student." },
      { status: 500 }
    );
  }
}

// Handler to add a new instructor
async function addInstructor(db, data) {
  const { firstName, lastName, email } = data;

  // Validation
  if (!firstName || !lastName || !email) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 }
    );
  }

  try {
    const insertSql = `
      INSERT INTO Instructors (firstName, lastName, email)
      VALUES (?, ?, ?)
    `;
    const [result] = await db.query(insertSql, [firstName, lastName, email]);

    return NextResponse.json(
      { message: "Instructor added successfully.", instructorID: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding instructor:", error);
    return NextResponse.json(
      { error: "Failed to add instructor." },
      { status: 500 }
    );
  }
}