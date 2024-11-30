import { createConnection } from "@/lib/db.js";
import { NextResponse } from "next/server";
import dotenv from "dotenv";

dotenv.config();

export async function GET(req, context) {
  try {
    // Establish a database connection
    const db = await createConnection("project");

    // SQL query to fetch instructor details
    const sql = `
      SELECT 
        instructorID AS instructorID,
        firstName AS firstName,
        lastName AS lastName,
        email AS email
      FROM 
        Instructors;
    `;

    // Query the database
    const [instructorDetails] = await db.query(sql);

    // Handle empty results
    if (!instructorDetails || instructorDetails.length === 0) {
      return NextResponse.json({
        message: "No instructor details found.",
      });
    }

    // Respond with instructor details
    return NextResponse.json({ instructorDetails });
  } catch (error) {
    console.error("Error occurred:", error.message);
    return NextResponse.json({ error: error.message });
  }
}