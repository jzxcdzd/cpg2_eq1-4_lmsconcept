import React from "react";
import AssignmentComponent from "./AssignmentComponent";
import CourseDetails from "../CourseDetails";
import NavigationBar from "../NavigationBar";

const App = () => {
  return (
    <div>
      <NavigationBar />
      <CourseDetails />
      <AssignmentComponent />
    </div>
  );
};

export default App;
