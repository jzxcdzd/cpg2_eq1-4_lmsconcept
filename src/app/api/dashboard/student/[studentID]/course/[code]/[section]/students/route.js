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
        Students.firstName, 
        Students.lastName, 
        Sections.section
      FROM 
        Students
      INNER JOIN 
        Enrollments ON Students.studentID = Enrollments.studentID
      INNER JOIN 
        Sections ON Enrollments.sectionID = Sections.sectionID
      INNER JOIN 
        Courses ON Sections.courseID = Courses.courseID
      WHERE 
        Courses.code = ? AND Sections.section = ?;
    `;

    const [students] = await db.query(sql, [code, section]);

    if (!students || students.length === 0) {
      return NextResponse.json({ message: "No students found for the given course and section." });
    }

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Error occurred:", error.message);
    return NextResponse.json({ error: error.message });
  }
}