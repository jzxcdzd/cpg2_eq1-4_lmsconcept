import { createConnection } from "@/lib/db.js";
import { NextResponse } from "next/server";
import dotenv from 'dotenv';

dotenv.config();

export async function GET() {
  try {
    const db = await createConnection('project'); // project == database name
    const sql = "SELECT * FROM Students";
    const [students] = await db.query(sql);
    return NextResponse.json({ students: students });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message });
  }
}

export async function POST(request) {
  try {
    const db = await createConnection('project'); // project == database name
    const { name } = await request.json();
    const sql = "INSERT INTO Students (name) VALUES (?)";
    await db.query(sql, [name]);
    return NextResponse.json({ message: "Student added successfully" });
  }
  catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message });
  }
}