// /app/api/dashboard/student/[studentID]/course/[code]/[section]/lessons/route.js
import { createConnection } from "@/lib/db.js";
import { NextResponse } from "next/server";
import dotenv from "dotenv";

dotenv.config();

export async function GET(req, context) {
  try {
    const { studentID, code, section } = context.params;

    if (!studentID || !code || !section) {
      return NextResponse.json(
        { error: "Missing required parameters: code, section, or studentID" },
        { status: 400 }
      );
    }

    const db = await createConnection("project");

    // Verify if the student is enrolled in the course and section
    const enrollmentSql = `
      SELECT 
        Enrollments.enrollmentID
      FROM 
        Enrollments
      INNER JOIN 
        Courses ON Enrollments.courseID = Courses.courseID
      INNER JOIN 
        Sections ON Enrollments.sectionID = Sections.sectionID
      WHERE 
        Enrollments.studentID = ?
        AND Courses.code = ?
        AND Sections.section = ?
    `;

    const [enrollment] = await db.query(enrollmentSql, [studentID, code, section]);

    if (!enrollment || enrollment.length === 0) {
      return NextResponse.json(
        { error: "Student is not enrolled in the specified course and section." },
        { status: 403 }
      );
    }

    const courseSql = `
      SELECT 
        Courses.courseID,
        Courses.name AS courseName,
        Courses.code AS courseCode,
        Courses.description AS courseDescription,
        Sections.sectionID,
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
        Courses.code = ?
        AND Sections.section = ?
    `;

    const [courseDetails] = await db.query(courseSql, [code, section]);

    if (!courseDetails || courseDetails.length === 0) {
      return NextResponse.json(
        { message: "No courses found for the given course code and section." },
        { status: 404 }
      );
    }

    const { courseID, sectionID } = courseDetails[0];

    const lessonsSql = `
      SELECT 
        courseID,
        sectionID,
        Lesson AS lessonName,
        OrderIndex AS orderIndex,  
        Type AS type,
        Content AS content,
        Link AS link
      FROM 
        SectionLessonContent
      WHERE 
        courseID = ?
        AND sectionID = ?
      ORDER BY 
        Lesson, OrderIndex
    `;
    
    const [lessons] = await db.query(lessonsSql, [courseID, sectionID]);

    return NextResponse.json({
      courseDetails: courseDetails[0],
      lessons,
    });
  } catch (error) {
    console.error("GET Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}