import React from "react";
import CourseDetails from "../CourseDetails";
import AssignmentComponent from "./AssignmentComponent";
import { Navigation } from "@mui/icons-material";
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
