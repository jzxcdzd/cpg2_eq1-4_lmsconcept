// /app/api/dashboard/instructor/[instructorID]/course/[code]/[section]/assignments/route.js
import { createConnection } from "@/lib/db.js";
import { NextResponse } from "next/server";
import dotenv from "dotenv";

dotenv.config();

export async function GET(req, context) {
  try {
    const { instructorID, code, section } = await context.params;

    if (!instructorID || !code || !section) {
      return NextResponse.json(
        { error: "Missing required parameters: code, section, or instructorID" },
        { status: 400 }
      );
    }

    console.log(`Fetching assignments for instructorID: ${instructorID}, code: ${code}, section: ${section}`);

    const db = await createConnection("project");

    const courseSql = `
      SELECT 
        Courses.courseID,
        Sections.sectionID
      FROM 
        Courses
      INNER JOIN 
        Sections ON Courses.courseID = Sections.courseID
      INNER JOIN 
        Instructors ON Sections.instructorID = Instructors.instructorID
      WHERE 
        Instructors.instructorID = ?
        AND Courses.code = ?
        AND Sections.section = ?
    `;

    const [courseDetails] = await db.query(courseSql, [instructorID, code, section]);

    if (!courseDetails || courseDetails.length === 0) {
      return NextResponse.json(
        { message: "No courses found for the given instructor, course code, and section." },
        { status: 404 }
      );
    }

    const { courseID, sectionID } = courseDetails[0];

    const assignmentsSql = `
      SELECT 
        Assignments.assignmentID,
        Assignments.name AS assignmentName,
        Assignments.description AS assignmentDescription,
        Assignments.dueDate AS assignmentDueDate
      FROM 
        Assignments
      INNER JOIN 
        SectionAssignments ON Assignments.assignmentID = SectionAssignments.assignmentID
      WHERE 
        SectionAssignments.sectionID = ?
    `;

    const [assignments] = await db.query(assignmentsSql, [sectionID]);

    console.log('Fetched assignments:', assignments);

    return NextResponse.json({
      assignments,
    });
  } catch (error) {
    console.error("GET Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req, context) {
  try {
    const { instructorID, code, section } = await context.params;
    const { name, description, dueDate } = await req.json();

    if (!instructorID || !code || !section) {
      return NextResponse.json(
        { error: "Missing required parameters: code, section, or instructorID" },
        { status: 400 }
      );
    }

    if (!name || !description || !dueDate) {
      return NextResponse.json(
        { error: "Missing assignment data: name, description, or dueDate" },
        { status: 400 }
      );
    }

    console.log(`Adding assignment for instructorID: ${instructorID}, code: ${code}, section: ${section}`);

    const db = await createConnection("project");

    const courseSql = `
      SELECT 
        Sections.sectionID
      FROM 
        Courses
      INNER JOIN 
        Sections ON Courses.courseID = Sections.courseID
      INNER JOIN 
        Instructors ON Sections.instructorID = Instructors.instructorID
      WHERE 
        Instructors.instructorID = ?
        AND Courses.code = ?
        AND Sections.section = ?
    `;

    const [courseDetails] = await db.query(courseSql, [instructorID, code, section]);

    if (!courseDetails || courseDetails.length === 0) {
      return NextResponse.json(
        { message: "No courses found for the given instructor, course code, and section." },
        { status: 404 }
      );
    }

    const { sectionID } = courseDetails[0];

    // Insert new assignment into Assignments table
    const insertAssignmentSql = `
      INSERT INTO Assignments (name, description, dueDate)
      VALUES (?, ?, ?)
    `;

    const [assignmentResult] = await db.query(insertAssignmentSql, [name, description, dueDate]);

    const newAssignmentID = assignmentResult.insertId;

    // Associate the new assignment with the section
    const insertSectionAssignmentSql = `
      INSERT INTO SectionAssignments (sectionID, assignmentID)
      VALUES (?, ?)
    `;

    await db.query(insertSectionAssignmentSql, [sectionID, newAssignmentID]);

    console.log(`New assignment added with ID: ${newAssignmentID}`);

    return NextResponse.json({
      message: "Assignment added successfully",
      assignmentID: newAssignmentID,
    });
  } catch (error) {
    console.error("POST Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}