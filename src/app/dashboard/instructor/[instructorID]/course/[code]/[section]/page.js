import React from "react";
import LessonComponent from "./LessonComponent";
import CourseDetails from "./CourseDetails";

const App = () => {
  const lessons = [
    {
      id: 1,
      title: "Lesson 01 - Dot",
      presentationLink: "/path/to/presentation1",
      details: [
        { type: "text", text: "Review of this" },
        { type: "text", text: "Introduction to that" },
        { type: "link", href: "/path/to/assignment1", text: "Assignment 1" },
      ],
    },
    {
      id: 2,
      title: "Lesson 02 - Dott",
      presentationLink: "/path/to/presentation2",
      details: [
        { type: "text", text: "Review of this other thing" },
        { type: "text", text: "Introduction to that other thing" },
        { type: "link", href: "/path/to/assignment2", text: "Assignment 2" },
      ],
    },
  ];

  return (
    <div>
      <CourseDetails />
      {lessons.map((lesson) => (
        <LessonComponent
          key={lesson.id}
          lessonTitle={lesson.title}
          presentationLink={lesson.presentationLink}
          details={lesson.details}
        />
      ))}
    </div>
  );
};

export default App;
