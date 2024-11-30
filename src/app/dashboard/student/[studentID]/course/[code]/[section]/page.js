import React from "react";
import LessonComponent from "./LessonComponent";
import CourseDetails from "./CourseDetails";

const App = () => {
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
