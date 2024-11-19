import { createConnection } from "@/lib/db.js";
import { NextResponse } from "next/server";
import dotenv from "dotenv";

dotenv.config();

export async function GET(req, context) {
  try {
    // Establish a database connection
    const db = await createConnection("project");

    // SQL query to fetch student details
    const sql = `
      SELECT 
        studentID AS studentID,
        firstName AS firstName,
        lastName AS lastName,
        email AS email,
        bio AS bio,
        birthday AS birthday
      FROM 
        Students;
    `;

    // Query the database
    const [studentDetails] = await db.query(sql);

    // Handle empty results
    if (!studentDetails || studentDetails.length === 0) {
      return NextResponse.json({
        message: "No student details found.",
      });
    }

    // Respond with student details
    return NextResponse.json({ studentDetails });
  } catch (error) {
    console.error("Error occurred:", error.message);
    return NextResponse.json({ error: error.message });
  }
}