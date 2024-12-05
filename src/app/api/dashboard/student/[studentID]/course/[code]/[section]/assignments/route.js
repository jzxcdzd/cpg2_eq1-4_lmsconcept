import { createConnection } from "@/lib/db.js";
import { NextResponse } from "next/server";
import dotenv from "dotenv";

dotenv.config();

export async function GET(req, context) {
  const { studentID, code, section } = context.params;
  try {
    const db = await createConnection("project");

    // Fetch sectionID based on the section name and course code
    const [sections] = await db.query(
      `
      SELECT sectionID
      FROM Sections
      WHERE section = ?
      AND courseID = (SELECT courseID FROM Courses WHERE code = ?)
      `,
      [section, code]
    );

    if (sections.length === 0) {
      return NextResponse.json(
        { error: "Section not found." },
        { status: 404 }
      );
    }

    const sectionID = sections[0].sectionID;

    // Fetch Assignments for the current section
    const [assignments] = await db.query(
      `
      SELECT a.assignmentID, a.name, a.description, a.dueDate
      FROM Assignments a
      JOIN SectionAssignments sa ON a.assignmentID = sa.assignmentID
      WHERE sa.sectionID = ?
      `,
      [sectionID]
    );

    // Fetch Submissions for the current student in the current section
    const [submissions] = await db.query(
      `
      SELECT 
        s.submissionID,
        s.assignmentID,
        s.studentID,
        s.submissionDate,
        s.submissionLink,
        s.grade
      FROM Submissions s
      JOIN Assignments a ON s.assignmentID = a.assignmentID
      JOIN SectionAssignments sa ON a.assignmentID = sa.assignmentID
      WHERE s.studentID = ?
      AND sa.sectionID = ?
      `,
      [studentID, sectionID]
    );

    return NextResponse.json({ assignments, submissions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching assignments and submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments and submissions." },
      { status: 500 }
    );
  }
}

export async function POST(req, context) {
  const { studentID, code, section } = context.params;

  try {
    const db = await createConnection("project");
    const { action, data } = await req.json();

    if (!action || !data) {
      return NextResponse.json(
        { error: "Action and data are required." },
        { status: 400 }
      );
    }

    // Fetch sectionID based on the section name and course code
    const [sections] = await db.query(
      `
      SELECT sectionID
      FROM Sections
      WHERE section = ?
      AND courseID = (SELECT courseID FROM Courses WHERE code = ?)
      `,
      [section, code]
    );

    if (sections.length === 0) {
      return NextResponse.json(
        { error: "Section not found." },
        { status: 404 }
      );
    }

    const sectionID = sections[0].sectionID;

    switch (action) {
      case "submitAssignment":
        return await submitAssignment(db, data, sectionID);
      default:
        return NextResponse.json(
          { error: "Invalid action." },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error processing POST request:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

async function submitAssignment(db, data, sectionID) {
  const { assignmentID, studentID, submissionLink } = data;

  // Validation
  if (!assignmentID || !studentID || !submissionLink) {
    return NextResponse.json(
      { error: "Assignment ID, Student ID, and Submission Link are required." },
      { status: 400 }
    );
  }

  try {
    // Insert or update the submission
    const [existingSubmission] = await db.query(
      `
      SELECT submissionID
      FROM Submissions
      WHERE assignmentID = ? AND studentID = ?
      `,
      [assignmentID, studentID]
    );

    if (existingSubmission.length > 0) {
      // Update existing submission
      await db.query(
        `
        UPDATE Submissions
        SET submissionLink = ?, submissionDate = NOW()
        WHERE submissionID = ?
        `,
        [submissionLink, existingSubmission[0].submissionID]
      );
    } else {
      // Insert new submission
      await db.query(
        `
        INSERT INTO Submissions (assignmentID, studentID, submissionLink, submissionDate)
        VALUES (?, ?, ?, NOW())
        `,
        [assignmentID, studentID, submissionLink]
      );
    }

    // Fetch updated submissions for the current student
    const [submissions] = await db.query(
      `
      SELECT 
        s.submissionID,
        s.assignmentID,
        s.studentID,
        s.submissionDate,
        s.submissionLink,
        s.grade
      FROM Submissions s
      JOIN Assignments a ON s.assignmentID = a.assignmentID
      JOIN SectionAssignments sa ON a.assignmentID = sa.assignmentID
      WHERE s.studentID = ?
      AND sa.sectionID = ?
      `,
      [studentID, sectionID]
    );

    return NextResponse.json({ submissions }, { status: 200 });
  } catch (error) {
    console.error("Error submitting assignment:", error);
    return NextResponse.json(
      { error: "Failed to submit assignment." },
      { status: 500 }
    );
  }
}