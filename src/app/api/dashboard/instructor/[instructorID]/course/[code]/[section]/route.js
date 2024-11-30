import { createConnection } from "@/lib/db.js";
import { NextResponse } from "next/server";
import dotenv from "dotenv";

dotenv.config();

export async function GET(req, context) {
  try {
    // Extract parameters: instructorID, course code, and section
    const { instructorID, code, section } = context.params;

    // Validate parameters
    if (!instructorID || !code || !section) {
      return NextResponse.json({
        error: "Missing required parameters: code, section, or instructorID",
      });
    }

    // Establish a database connection
    const db = await createConnection("project");

    // SQL query to fetch courses for the specific instructor
    const sql = `
      SELECT 
        Courses.name AS courseName,
        Courses.code AS courseCode,
        Courses.description AS courseDescription,
        Sections.section AS sectionName,
        Instructors.firstName AS instructorFirstName,
        Instructors.lastName AS instructorLastName,
        Instructors.email AS instructorEmail,
        COALESCE(Assignments.name, 'None') AS assignmentName,
        COALESCE(Assignments.dueDate, 'None') AS assignmentDueDate
      FROM 
        Courses
      INNER JOIN 
        Sections ON Courses.courseID = Sections.courseID
      INNER JOIN 
        Instructors ON Sections.instructorID = Instructors.instructorID
      LEFT JOIN 
        SectionAssignments ON Sections.sectionID = SectionAssignments.sectionID
      LEFT JOIN 
        Assignments ON SectionAssignments.assignmentID = Assignments.assignmentID
      WHERE 
        Instructors.instructorID = ?
        AND Courses.code = ?
        AND Sections.section = ?
    `;

    // Query the database
    const [courseDetails] = await db.query(sql, [instructorID, code, section]);

    // Handle empty results
    if (!courseDetails || courseDetails.length === 0) {
      return NextResponse.json({
        message: "No courses found for the given instructor, course code, and section.",
      });
    }

    // Respond with course details
    return NextResponse.json({ courseDetails });
  } catch (error) {
    console.error("Error occurred:", error.message);
    return NextResponse.json({ error: error.message });
  }
}