import { createConnection } from "@/lib/db.js";
import { NextResponse } from "next/server";
import dotenv from "dotenv";

dotenv.config();

export async function GET(req, context) {
  try {
    // Establish a database connection
    const db = await createConnection("project");

    // SQL query to fetch courses for the specific student
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