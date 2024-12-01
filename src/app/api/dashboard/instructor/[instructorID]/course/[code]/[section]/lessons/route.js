// /app/api/dashboard/instructor/[instructorID]/course/[code]/[section]/lessons/route.js
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

    const db = await createConnection("project");

    const courseSql = `
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

    const [courseDetails] = await db.query(courseSql, [instructorID, code, section]);

    if (!courseDetails || courseDetails.length === 0) {
      return NextResponse.json(
        { message: "No courses found for the given instructor, course code, and section." },
        { status: 404 }
      );
    }

    const { courseID, sectionID } = courseDetails[0];

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

    const [lessons] = await db.query(lessonsSql, [courseID, sectionID]);

    return NextResponse.json({
      courseDetails: courseDetails[0],
      lessons,
    });
  } catch (error) {
    console.error("GET Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req, context) {
  let db;
  try {
    const { instructorID, code, section } = await context.params;
    const {
      action,
      lessons,
      newLesson,
      lessonName,
      orderIndex,
      type,
      content,
    } = await req.json();

    if (!instructorID || !code || !section) {
      return NextResponse.json(
        { error: "Missing required parameters: code, section, or instructorID" },
        { status: 400 }
      );
    }

    db = await createConnection("project");

    const courseSql = `
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

    const [courseDetails] = await db.query(courseSql, [instructorID, code, section]);

    if (!courseDetails || courseDetails.length === 0) {
      return NextResponse.json(
        { message: "No courses found for the given instructor, course code, and section." },
        { status: 404 }
      );
    }

    const { courseID, sectionID } = courseDetails[0];

    await db.beginTransaction();

    if (action === "update" && Array.isArray(lessons)) {
      const updateSql = `
        UPDATE SectionLessonContent
        SET Content = ?
        WHERE courseID = ?
          AND sectionID = ?
          AND Lesson = ?
          AND OrderIndex = ?
      `;

      for (const lesson of lessons) {
        const { content, lessonName, orderIndex } = lesson;
        await db.query(updateSql, [content, courseID, sectionID, lessonName, orderIndex]);
      }
    }

    if (action === "add" && newLesson) {
      const { lessonName, type, content } = newLesson;

      const insertLessonSql = `
        INSERT INTO SectionLessonContent (courseID, sectionID, Lesson, OrderIndex, Type, Content)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      // Determine the next OrderIndex for the new lesson
      const [maxOrder] = await db.query(
        `SELECT MAX(OrderIndex) as maxOrder FROM SectionLessonContent WHERE courseID = ? AND sectionID = ? AND Lesson = ?`,
        [courseID, sectionID, lessonName]
      );
      const nextOrderIndex = maxOrder[0].maxOrder ? maxOrder[0].maxOrder + 1 : 1;

      await db.query(insertLessonSql, [
        courseID,
        sectionID,
        lessonName,
        nextOrderIndex,
        type,
        content,
      ]);
    }

    if (action === "addContent") {
      if (!lessonName || !type || !content) {
        throw new Error("Missing required fields for adding content.");
      }

      // Determine the next OrderIndex within the lesson
      const [maxOrder] = await db.query(
        `SELECT MAX(OrderIndex) as maxOrder FROM SectionLessonContent WHERE courseID = ? AND sectionID = ? AND Lesson = ?`,
        [courseID, sectionID, lessonName]
      );
      const nextOrderIndex = maxOrder[0].maxOrder ? maxOrder[0].maxOrder + 1 : 1;

      const insertContentSql = `
        INSERT INTO SectionLessonContent (courseID, sectionID, Lesson, OrderIndex, Type, Content)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      await db.query(insertContentSql, [
        courseID,
        sectionID,
        lessonName,
        nextOrderIndex,
        type,
        content,
      ]);
    }

    if (action === "delete") {
      if (!lessonName || !orderIndex || !type || !content) {
        throw new Error("Missing required fields for deleting content.");
      }

      const deleteSql = `
        DELETE FROM SectionLessonContent
        WHERE courseID = ?
          AND sectionID = ?
          AND Lesson = ?
          AND OrderIndex = ?
          AND Type = ?
          AND Content = ?
      `;

      await db.query(deleteSql, [courseID, sectionID, lessonName, orderIndex, type, content]);
    }

    // Handle Deleting Entire Lesson
    if (action === "deleteLesson") {
      if (!lessonName) {
        throw new Error("Missing required field: lessonName.");
      }

      const deleteLessonSql = `
        DELETE FROM SectionLessonContent
        WHERE courseID = ?
          AND sectionID = ?
          AND Lesson = ?
      `;

      await db.query(deleteLessonSql, [courseID, sectionID, lessonName]);
    }

    await db.commit();

    // Fetch Updated Lessons
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

    const [updatedLessons] = await db.query(lessonsSql, [courseID, sectionID]);

    return NextResponse.json({
      lessons: updatedLessons,
    });
  } catch (error) {
    if (db) await db.rollback();
    console.error("POST Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}