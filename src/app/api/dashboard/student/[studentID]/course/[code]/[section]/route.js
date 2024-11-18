import { createConnection } from "@/lib/db.js";
import { NextResponse } from "next/server";
import dotenv from "dotenv";

dotenv.config();

export async function GET(req, context) {
  try {
    // Extract parameters: studentID, course code, and section
    const { studentID, code, section } = context.params;

    // Validate parameters
    if (!studentID || !code || !section) {
      return NextResponse.json({
        error: "Missing required parameters: code, section, or studentID",
      });
    }

    // Establish a database connection
    const db = await createConnection("project");

    // SQL query to fetch courses for the specific student
    const sql = `
      SELECT 
        Courses.name AS courseName,
        Courses.code AS courseCode,
        Courses.description AS courseDescription,
        Sections.section AS sectionName,
        Instructors.firstName AS instructorFirstName,
        Instructors.lastName AS instructorLastName,
        Instructors.email AS instructorEmail
      FROM 
        Courses
      INNER JOIN 
        Sections ON Courses.courseID = Sections.courseID
      INNER JOIN 
        Enrollments ON Sections.sectionID = Enrollments.sectionID
      INNER JOIN 
        Students ON Enrollments.studentID = Students.studentID
      INNER JOIN 
        Instructors ON Sections.instructorID = Instructors.instructorID
      WHERE 
        Students.studentID = ?
		AND Courses.code = ?
        AND Sections.section = ?
    `;

    // Query the database
    const [courseDetails] = await db.query(sql, [studentID, code, section]);

    // Handle empty results
    if (!courseDetails || courseDetails.length === 0) {
      return NextResponse.json({
        message: "No courses found for the given student, course code, and section.",
      });
    }

    // Respond with course details
    return NextResponse.json({ courseDetails });
  } catch (error) {
    console.error("Error occurred:", error.message);
    return NextResponse.json({ error: error.message });
  }
}