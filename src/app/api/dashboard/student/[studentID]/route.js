// route.js
import { createConnection } from "@/lib/db.js";
import { NextResponse } from "next/server";
import dotenv from "dotenv";

dotenv.config();

export async function GET(req, context) {
  try {
    // Extract parameters: studentID
    const { studentID } = context.params;

    // Validate parameters
    if (!studentID) {
      return NextResponse.json(
        {
          error: "Missing required parameters: studentID",
        },
        { status: 400 }
      );
    }

    // Establish a database connection
    const db = await createConnection("project");

    // Updated SQL query to fetch courses along with all assignments for each course
    const sql = `
      SELECT 
        Courses.courseID,
        Courses.name AS courseName,
        Courses.code AS courseCode,
        Courses.description AS courseDescription,
        Sections.sectionID,
        Sections.section AS sectionName,
        Instructors.firstName AS instructorFirstName,
        Instructors.lastName AS instructorLastName,
        Instructors.email AS instructorEmail,
        Assignments.assignmentID,
        Assignments.name AS assignmentName,
        Assignments.dueDate AS assignmentDueDate
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
      WHERE 
        Students.studentID = ?
      ORDER BY 
        Courses.name, Assignments.dueDate ASC;
    `;

    // Query the database
    const [rows] = await db.query(sql, [studentID]);

    // Handle empty results
    if (!rows || rows.length === 0) {
      return NextResponse.json(
        {
          message: "No courses found for the given student.",
        },
        { status: 404 }
      );
    }

    // Process rows to group assignments under their respective courses
    const courseMap = {};

    rows.forEach((row) => {
      const courseKey = `${row.courseID}-${row.sectionID}`;
      if (!courseMap[courseKey]) {
        courseMap[courseKey] = {
          courseID: row.courseID,
          courseName: row.courseName,
          courseCode: row.courseCode,
          courseDescription: row.courseDescription,
          sectionID: row.sectionID,
          sectionName: row.sectionName,
          instructorFirstName: row.instructorFirstName,
          instructorLastName: row.instructorLastName,
          instructorEmail: row.instructorEmail,
          assignments: [],
        };
      }

      if (row.assignmentID) {
        courseMap[courseKey].assignments.push({
          assignmentID: row.assignmentID,
          name: row.assignmentName,
          dueDate: row.assignmentDueDate,
        });
      }
    });

    // Convert the map to an array
    const courseDetails = Object.values(courseMap);

    // Respond with course details
    return NextResponse.json({ courseDetails }, { status: 200 });
  } catch (error) {
    console.error("Error occurred:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, context) {
  try {
    // Parse the JSON body of the request
    const body = await req.json();
    const { studentID, sectionID } = body;

    // Validate the presence of required parameters
    if (!studentID || !sectionID) {
      return NextResponse.json(
        {
          error: "Missing required parameters: studentID and sectionID.",
        },
        { status: 400 }
      );
    }

    // Establish a database connection
    const db = await createConnection("project");

    // SQL query to delete the enrollment
    const deleteSql = `
      DELETE FROM Enrollments
      WHERE studentID = ? AND sectionID = ?
    `;

    // Execute the DELETE query
    const [result] = await db.query(deleteSql, [studentID, sectionID]);

    // Check if a row was deleted
    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          error: "Enrollment not found or already deleted.",
        },
        { status: 404 }
      );
    }

    // Respond with a success message
    return NextResponse.json(
      {
        message: "Course dropped successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error occurred while dropping course:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}