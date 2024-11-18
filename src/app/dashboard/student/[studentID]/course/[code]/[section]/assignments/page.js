"use client";

import React, { useState } from "react";
import AssignmentComponent from "./AssignmentComponent";
import CourseDetails from "../CourseDetails";

const StudentAssignmentPage = () => {
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      name: "Module 2 Preliminary Report",
      dueDate: "11/04/2024",
      submissionLink: "",
      grade: null,
      isSubmitted: true,
    },
    {
      id: 2,
      name: "Assignment 2",
      dueDate: "11/05/2024",
      submissionLink: "",
      grade: null,
      isSubmitted: false,
    },
  ]);

  const handleSubmit = (id, link) => {
    setAssignments((prevAssignments) =>
      prevAssignments.map((assignment) =>
        assignment.id === id
          ? { ...assignment, submissionLink: link, isSubmitted: true }
          : assignment
      )
    );

    alert("Assignment submitted successfully!");
  };

  return (
    <div>
      <CourseDetails />
      {assignments.map((assignment) => (
        <AssignmentComponent
          key={assignment.id}
          assignmentName={assignment.name}
          assignmentDueDate={assignment.dueDate}
          submissionLink={assignment.submissionLink}
          grade={assignment.grade}
          isSubmitted={assignment.isSubmitted}
          handleSubmit={(link) => handleSubmit(assignment.id, link)}
        />
      ))}
    </div>
  );
};

export default StudentAssignmentPage;