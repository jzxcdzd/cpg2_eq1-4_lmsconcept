// AssignmentComponent.js
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Typography,
  List,
  CircularProgress,
  Button,
  TextField,
  ListItem,
  Snackbar,
  Alert,
} from "@mui/material";

const AssignmentComponent = () => {
  const { studentID, code, section } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Refactored fetchAssignments using useCallback
  const fetchAssignments = useCallback(async () => {
    setLoading(true);
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
  }, [studentID, code, section]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleInputChange = (e, assignmentId) => {
    const { value } = e.target;
    setSubmissions((prevSubmissions) => {
      const existingSubmission = prevSubmissions.find(
        (sub) => sub.assignmentID === assignmentId
      );

      if (existingSubmission) {
        // Update existing submission and mark as edited
        return prevSubmissions.map((submission) =>
          submission.assignmentID === assignmentId
            ? { ...submission, submissionLink: value, isEdited: true }
            : submission
        );
      } else {
        // Create new submission and mark as edited
        return [
          ...prevSubmissions,
          { assignmentID: assignmentId, submissionLink: value, grade: null, isEdited: true },
        ];
      }
    });
  };

  const handleSubmitAssignment = async (assignmentId) => {
    const submission = submissions.find((sub) => sub.assignmentID === assignmentId);
    const submissionLink = submission ? submission.submissionLink : "";

    if (!submissionLink) {
      setSnackbar({
        open: true,
        message: "Submission link is required.",
        severity: "error",
      });
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
        setSnackbar({
          open: true,
          message: data.error,
          severity: "error",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Submission updated successfully.",
          severity: "success",
        });
        // Refetch assignments to get the updated submission and grade
        await fetchAssignments();
      }
    } catch (err) {
      console.error("Failed to update submission:", err);
      setSnackbar({
        open: true,
        message: err.message,
        severity: "error",
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
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
          const grade = submission ? submission.grade : null;
          const isEdited = submission ? submission.isEdited : false;

          return (
            <ListItem key={assignment.assignmentID} sx={{ mb: 2 }}>
              <Box width="100%">
                {/* Increased Assignment Name Font Size */}
                <Typography variant="h5" gutterBottom>
                  {assignment.name}
                </Typography>
                {/* Increased Description Font Size */}
                <Typography variant="subtitle1">{assignment.description}</Typography>
                {grade !== null && (
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, fontWeight: "bold", fontSize: "1rem", color: "#ffeb3b" }} // Emphasized Grade
                  >
                    Grade: {grade}
                  </Typography>
                )}
                <TextField
                  label="Submission Link"
                  value={submissionLink}
                  onChange={(e) => handleInputChange(e, assignment.assignmentID)}
                  fullWidth={false}
                  style={{ width: "50%" }}
                  sx={{
                    backgroundColor: "#fff",
                    borderRadius: 1,
                    mt: 1,
                    width: "50%",
                  }}
                />
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: isEdited
                      ? "#2196f3" // Blue for Resubmit
                      : submissionLink
                      ? "#4caf50" // Green for Submitted
                      : "#ff9800", // Orange for Submit
                    color: "#000",
                    mt: 1,
                    "&:hover": {
                      backgroundColor: isEdited
                        ? "#1976d2" // Darker blue on hover
                        : submissionLink
                        ? "#43a047" // Darker green on hover
                        : "#e68900", // Darker orange on hover
                    },
                  }}
                  onClick={() => handleSubmitAssignment(assignment.assignmentID)}
                  disabled={!submissionLink}
                >
                  {isEdited
                    ? "Resubmit"
                    : submissionLink
                    ? "Submitted"
                    : "Submit"}
                </Button>
              </Box>
            </ListItem>
          );
        })}
      </List>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AssignmentComponent;