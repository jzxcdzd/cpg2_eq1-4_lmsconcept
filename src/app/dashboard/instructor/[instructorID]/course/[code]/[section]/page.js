import React from "react";
import LessonComponent from "./LessonComponent";
import CourseDetails from "./CourseDetails";
import NavigationBar from "./NavigationBar";

const App = () => {
  return (
    <div>
      <NavigationBar />
      <CourseDetails />
      <LessonComponent />
    </div>
  );
};

export default App;
