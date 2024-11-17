import { createConnection } from "@/lib/db.js";
import { NextResponse } from "next/server";
import dotenv from 'dotenv';

dotenv.config();

export async function GET(req, context) {
  try {
    const { code, section } = context.params;

    if (!code || !section) {
      return NextResponse.json({ error: "Missing required parameters: code or section" });
    }

    const db = await createConnection('project');

    const sql = `
      SELECT 
        Courses.name AS courseName,
        Courses.code AS courseCode,
        Courses.description AS courseDescription,
        Instructors.firstName AS instructorFirstName,
        Instructors.lastName AS instructorLastName,
        Instructors.email AS instructorEmail,
        Sections.section AS sectionName
    FROM 
        Courses
    INNER JOIN 
        Sections ON Courses.courseID = Sections.courseID
    INNER JOIN 
        Instructors ON Sections.instructorID = Instructors.instructorID
    WHERE 
        Courses.code = ? AND Sections.section = ?
    `;

    const [courseDetails] = await db.query(sql, [code, section]);

    if (!courseDetails || courseDetails.length === 0) {
      return NextResponse.json({ message: "No students found for the given course and section." });
    }

    return NextResponse.json({ courseDetails });
  } catch (error) {
    console.error("Error occurred:", error.message);
    return NextResponse.json({ error: error.message });
  }
}