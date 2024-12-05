import { createConnection } from "@/lib/db.js";
import { NextResponse } from "next/server";
import dotenv from "dotenv";

dotenv.config();

export async function GET(req, context) {
  const { section } = await context.params;
  console.log("Section parameter (name):", section);

  try {
    const db = await createConnection("project");

    // Fetch sectionID based on the section name
    const [sections] = await db.query(
      `
      SELECT sectionID
      FROM Sections
      WHERE section = ?
      `,
      [section]
    );

    if (sections.length === 0) {
      return NextResponse.json(
        { error: "Section not found." },
        { status: 404 }
      );
    }

    const sectionID = sections[0].sectionID;
    console.log("Section ID:", sectionID);

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
    console.log("Assignments fetched from database:", assignments);

    return NextResponse.json({ assignments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments." },
      { status: 500 }
    );
  }
}

export async function POST(req, context) {
  const { section } = await context.params;

  try {
    const db = await createConnection("project");
    const { action, data } = await req.json();

    if (!action || !data) {
      return NextResponse.json(
        { error: "Action and data are required." },
        { status: 400 }
      );
    }

    // Fetch sectionID based on the section name
    const [sections] = await db.query(
      `
      SELECT sectionID
      FROM Sections
      WHERE section = ?
      `,
      [section]
    );

    if (sections.length === 0) {
      return NextResponse.json(
        { error: "Section not found." },
        { status: 404 }
      );
    }

    const sectionID = sections[0].sectionID;

    switch (action) {
      case "addAssignment":
        return await addAssignment(db, data, sectionID);
      case "deleteAssignment":
        return await deleteAssignment(db, data, sectionID);
      case "editAssignment":
        return await editAssignment(db, data, sectionID);
      default:
        return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }
  } catch (error) {
    console.error("Error processing POST request:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

async function addAssignment(db, data, sectionID) {
  const { name, description, dueDate } = data;

  // Validation
  if (!name || !description || !dueDate) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 }
    );
  }

  try {
    // Insert the new assignment
    const insertAssignmentSql = `
      INSERT INTO Assignments (name, description, dueDate)
      VALUES (?, ?, ?)
    `;
    const [assignmentResult] = await db.query(insertAssignmentSql, [
      name,
      description,
      dueDate,
    ]);

    const assignmentID = assignmentResult.insertId;

    // Link the assignment to the current section
    const insertSectionAssignmentSql = `
      INSERT INTO SectionAssignments (sectionID, assignmentID)
      VALUES (?, ?)
    `;
    await db.query(insertSectionAssignmentSql, [sectionID, assignmentID]);

    // Fetch the updated list of assignments for the current section
    const [assignments] = await db.query(
      `
      SELECT a.assignmentID, a.name, a.description, a.dueDate
      FROM Assignments a
      JOIN SectionAssignments sa ON a.assignmentID = sa.assignmentID
      WHERE sa.sectionID = ?
      `,
      [sectionID]
    );

    return NextResponse.json(
      {
        message: "Assignment added successfully.",
        assignments,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding assignment:", error);
    return NextResponse.json(
      { error: "Failed to add assignment." },
      { status: 500 }
    );
  }
}

async function deleteAssignment(db, data, sectionID) {
  const { assignmentID } = data;

  // Validation
  if (!assignmentID) {
    return NextResponse.json(
      { error: "Assignment ID is required." },
      { status: 400 }
    );
  }

  try {
    // Delete the assignment from SectionAssignments
    const deleteSectionAssignmentSql = `
      DELETE FROM SectionAssignments
      WHERE sectionID = ? AND assignmentID = ?
    `;
    await db.query(deleteSectionAssignmentSql, [sectionID, assignmentID]);

    // Delete the assignment from Assignments
    const deleteAssignmentSql = `
      DELETE FROM Assignments
      WHERE assignmentID = ?
    `;
    await db.query(deleteAssignmentSql, [assignmentID]);

    // Fetch the updated list of assignments for the current section
    const [assignments] = await db.query(
      `
      SELECT a.assignmentID, a.name, a.description, a.dueDate
      FROM Assignments a
      JOIN SectionAssignments sa ON a.assignmentID = sa.assignmentID
      WHERE sa.sectionID = ?
      `,
      [sectionID]
    );

    return NextResponse.json(
      {
        message: "Assignment deleted successfully.",
        assignments,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json(
      { error: "Failed to delete assignment." },
      { status: 500 }
    );
  }
}

async function editAssignment(db, data, sectionID) {
  const { assignmentID, name, description, dueDate } = data;

  // Validation
  if (!assignmentID || !name || !description || !dueDate) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 }
    );
  }

  try {
    // Update the assignment
    const editAssignmentSql = `
      UPDATE Assignments SET name = ?, description = ?, dueDate = ?
      WHERE assignmentID = ?
    `;
    await db.query(editAssignmentSql, [
      name,
      description,
      dueDate,
      assignmentID,
    ]);

    // Fetch the updated list of assignments for the current section
    const [assignments] = await db.query(
      `
      SELECT a.assignmentID, a.name, a.description, a.dueDate
      FROM Assignments a
      JOIN SectionAssignments sa ON a.assignmentID = sa.assignmentID
      WHERE sa.sectionID = ?
      `,
      [sectionID]
    );

    return NextResponse.json(
      {
        message: "Assignment updated successfully.",
        assignments,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json(
      { error: "Failed to update assignment." },
      { status: 500 }
    );
  }
}