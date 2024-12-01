// /app/api/dashboard/instructor/[instructorID]/course/[code]/[section]/route.js
import { createConnection } from "@/lib/db.js";
import { NextResponse } from "next/server";
import dotenv from "dotenv";

dotenv.config();

export async function GET(req, context) {

  try {
    const { instructorID, code, section } = await context.params;

    if (!instructorID || !code || !section) {
      return NextResponse.json({
        error: "Missing required parameters: code, section, or instructorID",
      });
    }

    const db = await createConnection("project");

    const courseSql = `
      SELECT 
        Courses.courseID AS courseID,
        Courses.name AS courseName,
        Courses.code AS courseCode,
        Courses.description AS courseDescription,
        Sections.sectionID AS sectionID,
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

    const [courseDetails] = await db.query(courseSql, [instructorID, code, section]);

    if (!courseDetails || courseDetails.length === 0) {
      return NextResponse.json({
        message: "No courses found for the given instructor, course code, and section.",
      });
    }

    return NextResponse.json({
      courseDetails: courseDetails[0],
    });
  } catch (error) {
    console.error("Error occurred:", error.message);
    return NextResponse.json({ error: error.message });
  }
}

export async function POST(req, context) {
  try {
    const { instructorID, code, section } = await context.params;
    const { courseDescription } = await req.json();

    if (!instructorID || !code || !section || !courseDescription) {
      return NextResponse.json({
        error: "Missing required parameters: code, section, instructorID, or courseDescription",
      });
    }

    const db = await createConnection("project");

    const updateSql = `
      UPDATE Courses
      INNER JOIN Sections ON Courses.courseID = Sections.courseID
      SET Courses.description = ?
      WHERE Sections.instructorID = ?
        AND Courses.code = ?
        AND Sections.section = ?
    `;

    await db.query(updateSql, [courseDescription, instructorID, code, section]);

    const courseSql = `
      SELECT 
        Courses.courseID AS courseID,
        Courses.name AS courseName,
        Courses.code AS courseCode,
        Courses.description AS courseDescription,
        Sections.sectionID AS sectionID,
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

    const [courseDetails] = await db.query(courseSql, [instructorID, code, section]);

    return NextResponse.json({
      courseDetails: courseDetails[0],
    });
  } catch (error) {
    console.error("Error occurred:", error.message);
    return NextResponse.json({ error: error.message });
  }
}