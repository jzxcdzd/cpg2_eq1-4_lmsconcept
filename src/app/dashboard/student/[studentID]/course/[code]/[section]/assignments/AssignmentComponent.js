"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Typography,
  List,
  CircularProgress,
  Button,
  TextField,
  ListItem,
} from "@mui/material";

const AssignmentComponent = () => {
  const { studentID, code, section } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch(
          `/api/dashboard/student/${studentID}/course/${code}/${section}/assignments`
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Fetched assignments and submissions:", data);

        setAssignments(data.assignments || []);
        setSubmissions(data.submissions || []);
      } catch (err) {
        console.error("Failed to fetch assignments:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [studentID, code, section]);

  const handleInputChange = (e, assignmentId) => {
    const updatedSubmissions = submissions.map((submission) =>
      submission.assignmentID === assignmentId
        ? { ...submission, submissionLink: e.target.value }
        : submission
    );
    setSubmissions(updatedSubmissions);
  };

  const handleSubmitAssignment = async (assignmentId) => {
    const submission = submissions.find((sub) => sub.assignmentID === assignmentId);
    const submissionLink = submission ? submission.submissionLink : "";

    if (!submissionLink) {
      alert("Submission link is required.");
      return;
    }

    try {
      const response = await fetch(
        `/api/dashboard/student/${studentID}/course/${code}/${section}/assignments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "submitAssignment",
            data: { assignmentID: assignmentId, studentID, submissionLink },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Server Error:", errorData);
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        console.error(data.error);
        setError(data.error);
      } else {
        setSubmissions((prev) => [
          ...prev.filter((sub) => sub.assignmentID !== assignmentId),
          data.submission,
        ]);
        alert("Submission updated successfully.");
      }
    } catch (err) {
      console.error("Failed to update submission:", err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={4}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        border: "1px solid #ccc",
        borderRadius: 2,
        padding: 2,
        marginBottom: 2,
        backgroundColor: "#121212",
        color: "#fff",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Assignments
      </Typography>
      <List>
        {assignments.map((assignment) => {
          if (!assignment.assignmentID) {
            console.error("Assignment ID is missing for assignment:", assignment);
            return null;
          }

          const submission = submissions.find(
            (sub) => sub.assignmentID === assignment.assignmentID
          );
          const submissionLink = submission ? submission.submissionLink : "";

          return (
            <ListItem key={assignment.assignmentID} sx={{ mb: 2 }}>
              <Box width="100%">
                <Typography variant="h6">{assignment.name}</Typography>
                <Typography variant="body1">{assignment.description}</Typography>
                <TextField
                  label="Submission Link"
                  value={submissionLink}
                  onChange={(e) => handleInputChange(e, assignment.assignmentID)}
                  fullWidth={false}
                  style={{ width: '50%' }}
                  sx={{ backgroundColor: "#fff", borderRadius: 1, mt: 1, width: '50%' }}
                />
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#ff9800", // Orange color
                    color: "#000",
                    mt: 1,
                    "&:hover": {
                      backgroundColor: "#e68900", // Darker orange on hover
                    },
                  }}
                  onClick={() => handleSubmitAssignment(assignment.assignmentID)}
                  disabled={!submissionLink}
                >
                  Submit
                </Button>
              </Box>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default AssignmentComponent;