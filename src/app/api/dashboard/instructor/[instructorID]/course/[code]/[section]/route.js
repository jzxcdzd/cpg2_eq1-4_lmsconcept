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

    // SQL query to fetch course details
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

    // Query for course details
    const [courseDetails] = await db.query(courseSql, [instructorID, code, section]);

    // Handle empty course details
    if (!courseDetails || courseDetails.length === 0) {
      return NextResponse.json({
        message: "No courses found for the given instructor, course code, and section.",
      });
    }

    const { courseID, sectionID } = courseDetails[0]; // Extract courseID and sectionID

    // SQL query to fetch lesson contents related to the course and section
    const lessonsSql = `
      SELECT 
  courseID,
  sectionID,
  Lesson AS lessonName,
  OrderIndex AS orderIndex,  
  Type AS type,
  Content AS content
FROM 
  SectionLessonContent
WHERE 
  courseID = ?
  AND sectionID = ?
ORDER BY 
  Lesson, OrderIndex
    `;

    // Query for lessons
    const [lessons] = await db.query(lessonsSql, [courseID, sectionID]);

    // Respond with combined course details and lessons
    return NextResponse.json({
      courseDetails: courseDetails[0],
      lessons,
    });
  } catch (error) {
    console.error("Error occurred:", error.message);
    return NextResponse.json({ error: error.message });
  }
}
