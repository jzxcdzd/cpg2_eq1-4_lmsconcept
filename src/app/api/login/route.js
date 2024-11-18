import { createConnection } from "@/lib/db.js";
import { NextResponse } from "next/server";
import dotenv from "dotenv";

dotenv.config();

export async function POST(req, context) {
  try {
    // Extract parameters: email and password from the request body
    const { email, password } = await req.json();

    // Validate parameters
    if (!email || !password) {
      return NextResponse.json({
        error: "Missing required parameters: email or password",
      });
    }

    // Establish a database connection
    const db = await createConnection("project");

    // SQL query to fetch the specific entry from the Accounts table
    const sql = `
      SELECT 
    Accounts.identifierID,
    Accounts.password,
    Accounts.userType,
    Students.studentID
  FROM 
    Accounts
  INNER JOIN 
    Students
  ON 
    Accounts.identifierID = Students.email
  WHERE 
    Accounts.identifierID = ? 
    AND Accounts.password = ?
    `;

    // Query the database
    const [accountDetails] = await db.query(sql, [email, password]);

    // Handle empty results
    if (!accountDetails || accountDetails.length === 0) {
      return NextResponse.json({
        message: "No account found for the given email and password.",
      });
    }

    // Respond with account details
    return NextResponse.json({ accountDetails });
  } catch (error) {
    console.error("Error occurred:", error.message);
    return NextResponse.json({ error: error.message });
  }
}