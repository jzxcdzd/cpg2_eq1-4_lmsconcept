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

    // Fetch Students
    const [students] = await db.query(`
      SELECT studentID, firstName, lastName, email
      FROM Students
    `);

    // Fetch Sections
    const [sections] = await db.query(`
      SELECT s.sectionID, s.section, s.courseID, c.name AS courseName
      FROM Sections s
      JOIN Courses c ON s.courseID = c.courseID
    `);

    // Fetch Enrollments with sectionName
    const [enrollments] = await db.query(`
      SELECT 
        e.enrollmentID, 
        e.studentID, 
        e.courseID, 
        e.sectionID,
        s.firstName AS studentFirstName, 
        s.lastName AS studentLastName,
        c.code AS courseCode,
        sec.section AS sectionName
      FROM 
        Enrollments e
      JOIN 
        Students s ON e.studentID = s.studentID
      JOIN 
        Sections sec ON e.sectionID = sec.sectionID
      JOIN 
        Courses c ON sec.courseID = c.courseID
    `);

    return NextResponse.json(
      { courses, instructors, students, sections, enrollments },
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
        return await assignStudent(db, data);
      case "editCourse":
        return await editCourse(db, data);
      case "editStudent":
        return await editStudent(db, data);
      case "editSection":
        return await editSection(db, data);
      case "deleteEnrollment":
        return await deleteEnrollment(db, data);
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
    // Check if courseCode already exists
    const [existingCourse] = await db.query(
      "SELECT * FROM Courses WHERE code = ?",
      [courseCode]
    );
    if (existingCourse.length > 0) {
      return NextResponse.json(
        { error: "Course code already exists." },
        { status: 400 }
      );
    }

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

    // Check if section already exists
    const [existingSection] = await db.query(
      "SELECT * FROM Sections WHERE courseID = ? AND section = ?",
      [courseID, section]
    );

    if (existingSection.length > 0) {
      if (existingSection[0].instructorID) {
        return NextResponse.json(
          { error: "This section already has an instructor assigned." },
          { status: 400 }
        );
      } else {
        // Assign the instructor to the existing section
        const updateSql = `
          UPDATE Sections
          SET instructorID = ?
          WHERE courseID = ? AND section = ?
        `;
        await db.query(updateSql, [instructorID, courseID, section]);
        return NextResponse.json(
          { message: "Instructor assigned to existing section successfully." },
          { status: 200 }
        );
      }
    }

    // Otherwise, insert new section
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
      { error: "Failed to assign student to course and section - already assigned to the same class or on a different section." },
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
      { error: "Failed to add student. The student already exists." },
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
    // Check if username already exists in Accounts
    const [existingAccount] = await db.query(
      "SELECT * FROM Accounts WHERE username = ?",
      [username]
    );
    if (existingAccount.length > 0) {
      return NextResponse.json(
        { error: "Username already exists." },
        { status: 400 }
      );
    }

    // Check if instructor with the same email already exists
    const [existingInstructor] = await db.query(
      "SELECT * FROM Instructors WHERE email = ?",
      [email]
    );
    if (existingInstructor.length > 0) {
      return NextResponse.json(
        { error: "Instructor with this email already exists." },
        { status: 400 }
      );
    }

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

// Handler to edit a course
async function editCourse(db, data) {
  const { courseID, courseName, courseCode, description } = data;

  // Validation
  if (!courseID || !courseName || !courseCode || !description) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 }
    );
  }

  try {
    const updateSql = `
      UPDATE Courses
      SET name = ?, code = ?, description = ?
      WHERE courseID = ?
    `;
    await db.query(updateSql, [courseName, courseCode, description, courseID]);

    return NextResponse.json(
      { message: "Course updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { error: "Failed to update course." },
      { status: 500 }
    );
  }
}

// Handler to edit a student
async function editStudent(db, data) {
  const { studentID, firstName, lastName, email, bio, username, password } = data;

  // Validation
  if (!studentID || !firstName || !lastName || !email || !username || !password) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 }
    );
  }

  try {
    // Start transaction
    await db.beginTransaction();

    // Update Accounts table
    const accountSql = `
      UPDATE Accounts
      SET username = ?, password = ?
      WHERE identifierID = ? AND usertype = 3
    `;
    await db.query(accountSql, [username, password, email]);

    // Update Students table
    const studentSql = `
      UPDATE Students
      SET firstName = ?, lastName = ?, email = ?, bio = ?
      WHERE studentID = ?
    `;
    await db.query(studentSql, [firstName, lastName, email, bio, studentID]);

    // Commit transaction
    await db.commit();

    return NextResponse.json(
      { message: "Student updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    // Rollback transaction on error
    await db.rollback();
    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: "Failed to update student." },
      { status: 500 }
    );
  }
}

// Handler to edit a section
async function editSection(db, data) {
  const { sectionID, courseID, section, instructorID } = data;

  // Validation
  if (!sectionID || !courseID || !section || !instructorID) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 }
    );
  }

  try {
    const updateSql = `
      UPDATE Sections
      SET courseID = ?, section = ?, instructorID = ?
      WHERE sectionID = ?
    `;
    await db.query(updateSql, [courseID, section, instructorID, sectionID]);

    return NextResponse.json(
      { message: "Section updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating section:", error);
    return NextResponse.json(
      { error: "Failed to update section." },
      { status: 500 }
    );
  }
}

// Handler to delete a student's enrollment
async function deleteEnrollment(db, data) {
  const { enrollmentID } = data;

  // Validation
  if (!enrollmentID) {
    return NextResponse.json(
      { error: "Enrollment ID is required." },
      { status: 400 }
    );
  }

  try {
    const deleteSql = `
      DELETE FROM Enrollments
      WHERE enrollmentID = ?
    `;
    const [result] = await db.query(deleteSql, [enrollmentID]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Enrollment not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Enrollment deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting enrollment:", error);
    return NextResponse.json(
      { error: "Failed to delete enrollment." },
      { status: 500 }
    );
  }
}