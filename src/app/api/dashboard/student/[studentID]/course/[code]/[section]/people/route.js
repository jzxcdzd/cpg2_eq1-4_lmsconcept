// /app/api/course/[code]/[section]/students/route.js

import { createConnection } from "@/lib/db.js";
import { NextResponse } from "next/server";
import dotenv from "dotenv";

dotenv.config();

export async function GET(req, context) {
  try {
    const { code, section } = context.params;

    if (!code || !section) {
      return NextResponse.json(
        { error: "Missing required parameters: code or section" },
        { status: 400 }
      );
    }

    const db = await createConnection("project");

    // Verify if the course and section exist
    const courseSectionSql = `
      SELECT 
        Courses.courseID,
        Courses.name AS courseName,
        Sections.sectionID,
        Sections.section AS sectionName
      FROM 
        Courses
      INNER JOIN 
        Sections ON Courses.courseID = Sections.courseID
      WHERE 
        Courses.code = ?
        AND Sections.section = ?
    `;

    const [courseSectionResults] = await db.query(courseSectionSql, [code, section]);

    if (!courseSectionResults || courseSectionResults.length === 0) {
      return NextResponse.json(
        { error: "No course found with the given code and section." },
        { status: 404 }
      );
    }

    const { courseID, sectionID } = courseSectionResults[0];

    // Fetch students enrolled in the specified course and section
    const studentsSql = `
      SELECT 
        Students.studentID,
        Students.firstName,
        Students.lastName
      FROM 
        Enrollments
      INNER JOIN 
        Students ON Enrollments.studentID = Students.studentID
      WHERE 
        Enrollments.courseID = ?
        AND Enrollments.sectionID = ?
      ORDER BY 
        Students.lastName, Students.firstName
    `;

    const [students] = await db.query(studentsSql, [courseID, sectionID]);

    return NextResponse.json({
      courseDetails: {
        courseID: courseID,
        courseName: courseSectionResults[0].courseName,
        courseCode: code,
        section: section,
      },
      students,
    });
  } catch (error) {
    console.error("Error occurred:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}