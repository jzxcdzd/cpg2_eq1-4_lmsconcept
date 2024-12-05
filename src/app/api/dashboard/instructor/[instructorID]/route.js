import { createConnection } from "@/lib/db.js";
import { NextResponse } from "next/server";
import dotenv from "dotenv";

dotenv.config();

export async function GET(req, context) {
  try {
    // Extract parameter: instructorID
    const { instructorID } = await context.params;

    // Validate parameter
    if (!instructorID) {
      return NextResponse.json({
        error: "Missing required parameter: instructorID",
      });
    }

    // Establish a database connection
    const db = await createConnection("project");

    // SQL query to fetch courses assigned to the specific instructor
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
        Instructors ON Sections.instructorID = Instructors.instructorID
      WHERE 
        Instructors.instructorID = ?
      ORDER BY 
        Courses.name
    `;

    // Query the database
    const [courseDetails] = await db.query(sql, [instructorID]);

    // Handle empty results
    if (!courseDetails || courseDetails.length === 0) {
      return NextResponse.json({
        message: "No courses found for the given instructor.",
      });
    }

    // Respond with course details
    return NextResponse.json({ courseDetails });
  } catch (error) {
    console.error("Error occurred:", error.message);
    return NextResponse.json({ error: error.message });
  }
}