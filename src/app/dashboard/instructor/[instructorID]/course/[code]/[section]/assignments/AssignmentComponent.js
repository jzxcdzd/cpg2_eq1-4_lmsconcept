"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Typography,
  List,
  ListItem,
  Divider,
  CircularProgress,
} from "@mui/material";

const AssignmentComponent = () => {
  const { instructorID, code, section } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch(
          `/api/dashboard/instructor/${instructorID}/course/${code}/${section}/assignments`
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data && Array.isArray(data.assignments)) {
          setAssignments(data.assignments);
        } else {
          setAssignments([]);
        }
      } catch (err) {
        console.error("Failed to fetch assignments:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [instructorID, code, section]);

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

  if (assignments.length === 0) {
    return (
      <Box mt={4}>
        <Typography variant="h6" color="textPrimary">
          No assignments found for this section.
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
        backgroundColor: "#121212",
        color: "#fff",
      }}
    >
      <Typography variant="h5" gutterBottom>
        Assignments
      </Typography>
      <List>
        {assignments.map((assignment) => (
          <React.Fragment key={assignment.assignmentID}>
            <ListItem alignItems="flex-start">
              <Box>
                <Typography variant="h6">{assignment.assignmentName}</Typography>
                <Typography variant="body1" color="inherit">
                  Due Date: {new Date(assignment.assignmentDueDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body1">{assignment.assignmentDescription}</Typography>
              </Box>
            </ListItem>
            <Divider component="li" sx={{ backgroundColor: "#555" }} />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default AssignmentComponent;