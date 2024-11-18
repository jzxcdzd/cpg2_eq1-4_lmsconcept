import { createConnection } from "@/lib/db.js";
import { NextResponse } from "next/server";
import dotenv from "dotenv";

dotenv.config();

export async function GET(req, context) {
  try {
    // Extract parameters: studentID, course code, and section
    const { studentID } = context.params;

    // Validate parameters
    if (!studentID) {
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
        Sections.section AS sectionName,
        COALESCE(Assignments.name, 'None') AS assignmentName,
        COALESCE(Assignments.dueDate, 'None') AS assignmentDueDate
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
      LEFT JOIN 
        SectionAssignments ON Sections.sectionID = SectionAssignments.sectionID
      LEFT JOIN 
        Assignments ON SectionAssignments.assignmentID = Assignments.assignmentID
      LEFT JOIN 
        Submissions ON Assignments.assignmentID = Submissions.assignmentID 
                    AND Submissions.studentID = Students.studentID
      WHERE 
        Students.studentID = ?
      ORDER BY 
        Courses.name, Assignments.dueDate;
    `;

    // Query the database
    const [courseDetails] = await db.query(sql, [studentID]);

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