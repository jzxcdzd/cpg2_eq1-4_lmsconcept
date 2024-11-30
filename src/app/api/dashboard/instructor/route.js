// /api/dashboard/instructors/route.js
import { createConnection } from "@/lib/db.js";
import { NextResponse } from "next/server";
import dotenv from "dotenv";

dotenv.config();

export async function GET(req, context) {
  try {
    const db = await createConnection("project");

    const sql = `
      SELECT 
        instructorID,
        firstName,
        lastName,
        email
      FROM 
        Instructors
      ORDER BY 
        lastName, firstName
    `;

    const [instructors] = await db.query(sql);

    if (instructors.length === 0) {
      return NextResponse.json(
        { message: "No instructors found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ instructors }, { status: 200 });
  } catch (error) {
    console.error("Error fetching instructors:", error);
    return NextResponse.json(
      { error: "Failed to fetch instructors." },
      { status: 500 }
    );
  }
}