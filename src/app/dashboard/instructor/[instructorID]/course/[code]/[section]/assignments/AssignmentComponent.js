"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Typography,
  List,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const AssignmentComponent = () => {
  const { instructorID, code, section } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [gradeInputs, setGradeInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [noSubmissionAlertOpen, setNoSubmissionAlertOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("add");
  const [newAssignment, setNewAssignment] = useState({
    assignmentID: "",
    name: "",
    description: "",
    dueDate: "",
  });

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
  }, [instructorID, code, section]);

  const handleOpenDialog = (type, assignment = null) => {
    setDialogType(type);
    if (type === "edit" && assignment) {
      setNewAssignment({
        assignmentID: assignment.assignmentID,
        name: assignment.name || assignment.assignmentName,
        description:
          assignment.description || assignment.assignmentDescription,
        dueDate: assignment.dueDate || "",
      });
    } else {
      setNewAssignment({
        assignmentID: "",
        name: "",
        description: "",
        dueDate: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewAssignment({
      assignmentID: "",
      name: "",
      description: "",
      dueDate: "",
    });
  };

  const handleInputChange = (e) => {
    setNewAssignment({ ...newAssignment, [e.target.name]: e.target.value });
  };

  const handleAddAssignment = async () => {
    if (!newAssignment.name || !newAssignment.description || !newAssignment.dueDate) {
      alert("All fields are required.");
      return;
    }

    try {
      const response = await fetch(
        `/api/dashboard/instructor/${instructorID}/course/${code}/${section}/assignments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "addAssignment",
            data: { ...newAssignment, sectionID: section },
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
        setAssignments(data.assignments);
        handleCloseDialog();
        setAlertOpen(true);
      }
    } catch (err) {
      console.error("Failed to add assignment:", err);
      setError(err.message);
    }
  };

  const handleEditAssignment = async () => {
    if (!newAssignment.name || !newAssignment.description || !newAssignment.dueDate) {
      alert("All fields are required.");
      return;
    }

    try {
      const response = await fetch(
        `/api/dashboard/instructor/${instructorID}/course/${code}/${section}/assignments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "editAssignment",
            data: { ...newAssignment, sectionID: section },
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
        setAssignments(data.assignments);
        handleCloseDialog();
        setAlertOpen(true);
      }
    } catch (err) {
      console.error("Failed to edit assignment:", err);
      setError(err.message);
    }
  };

  const handleDeleteAssignment = async (assignment) => {
    try {
      const response = await fetch(
        `/api/dashboard/instructor/${instructorID}/course/${code}/${section}/assignments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "deleteAssignment",
            data: { assignmentID: assignment.assignmentID },
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
        setAssignments(data.assignments);
        setAlertOpen(true);
      }
    } catch (err) {
      console.error("Failed to delete assignment:", err);
      setError(err.message);
    }
  };

  const handleGradeChange = (key, value) => {
    setGradeInputs({ ...gradeInputs, [key]: value });
  };

  const handleUpdateGrade = async (submission) => {
    const key = `${submission.AssignmentID}-${submission.StudentID}`;
    const gradeValue = gradeInputs[key];
    if (gradeValue === undefined || gradeValue === null) {
      alert("No grade value provided");
      return;
    }

    try {
      const response = await fetch(
        `/api/dashboard/instructor/${instructorID}/course/${code}/${section}/assignments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "updateGrade",
            data: {
              assignmentID: submission.AssignmentID,
              studentID: submission.StudentID,
              grade: gradeValue,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        console.error(data.error || "Server Error");
        setError(data.error || "Failed to update grade.");
      } else if (data.noSubmission) {
        setNoSubmissionAlertOpen(true);
      } else {
        setSubmissions((prevSubmissions) =>
          prevSubmissions.map((sub) => {
            if (
              sub.AssignmentID === submission.AssignmentID &&
              sub.StudentID === submission.StudentID
            ) {
              return { ...sub, grade: gradeValue };
            }
            return sub;
          })
        );
        setAlertOpen(true);
      }
    } catch (err) {
      console.error("Failed to update grade:", err);
      setError(err.message);
    }
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
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
      {/* Add Assignment Button */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog("add")}
        >
          Add Assignment
        </Button>
      </Box>

      {/* Assignments List */}
      {assignments.length === 0 ? (
        <Typography variant="h6" color="inherit">
          No assignments found for this section.
        </Typography>
      ) : (
        <List sx={{ padding: 0 }}>
          {assignments.map((assignment, index) => (
            <Accordion key={index}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel${index}-content`}
                id={`panel${index}-header`}
              >
                <Typography variant="h6" sx={{ marginRight: 1 }}>
                  {assignment.name || assignment.assignmentName}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconButton
                    onClick={() => handleOpenDialog("edit", assignment)}
                    sx={{ color: "black" }}
                    title="Edit Assignment"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteAssignment(assignment)}
                    sx={{ color: "#f44336" }}
                    title="Delete Assignment"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" color="inherit">
                  Due Date:{" "}
                  {new Date(
                    assignment.dueDate || assignment.assignmentDueDate
                  ).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                  })}
                </Typography>
                <Typography variant="body1">
                  {assignment.description ||
                    assignment.assignmentDescription}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6">Submissions:</Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Student Name</TableCell>
                        <TableCell>Submission Date</TableCell>
                        <TableCell>Submission Link</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Grade</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {submissions
                        .filter(
                          (submission) =>
                            submission.AssignmentID ===
                            assignment.assignmentID
                        )
                        .map((submission, subIndex) => {
                          const key = `${submission.AssignmentID}-${submission.StudentID}`;
                          const isLate =
                            submission.submissionDate &&
                            new Date(submission.submissionDate) >
                              new Date(assignment.dueDate);
                          const status = submission.submissionDate
                            ? isLate
                              ? "Late"
                              : "On time"
                            : "Missing";
                          return (
                            <TableRow key={subIndex}>
                              <TableCell>{submission.StudentName}</TableCell>
                              <TableCell>
                                {submission.submissionDate
                                  ? new Date(
                                      submission.submissionDate
                                    ).toLocaleString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                      hour: "numeric",
                                      minute: "numeric",
                                      hour12: true,
                                    })
                                  : ""}
                              </TableCell>
                              <TableCell>
                                {submission.submissionLink ? (
                                  <a
                                    href={submission.submissionLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {submission.submissionLink}
                                  </a>
                                ) : (
                                  ""
                                )}
                              </TableCell>
                              <TableCell>{status}</TableCell>
                              <TableCell>
                                <TextField
                                  type="number"
                                  InputProps={{ inputProps: { min: 0 } }}
                                  value={
                                    gradeInputs[key] ??
                                    submission.grade ??
                                    ""
                                  }
                                  onChange={(e) =>
                                    handleGradeChange(key, e.target.value)
                                  }
                                  placeholder="Enter grade"
                                  variant="standard"
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  onClick={() =>
                                    handleUpdateGrade(submission)
                                  }
                                >
                                  Update
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          ))}
        </List>
      )}

      {/* Add/Edit Assignment Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {dialogType === "add" ? "Add New Assignment" : "Edit Assignment"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Assignment Name"
            type="text"
            fullWidth
            value={newAssignment.name}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="description"
            label="Assignment Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={newAssignment.description}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="dueDate"
            label="Due Date"
            type="datetime-local"
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            value={newAssignment.dueDate}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            color="secondary"
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          {dialogType === "add" ? (
            <Button
              onClick={handleAddAssignment}
              color="primary"
              startIcon={<SaveIcon />}
            >
              Add
            </Button>
          ) : (
            <Button
              onClick={handleEditAssignment}
              color="primary"
              startIcon={<SaveIcon />}
            >
              Save
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={handleAlertClose}
      >
        <Alert
          onClose={handleAlertClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          Action completed successfully!
        </Alert>
      </Snackbar>

      {/* No Submission Alert */}
      <Snackbar
        open={noSubmissionAlertOpen}
        autoHideDuration={6000}
        onClose={() => setNoSubmissionAlertOpen(false)}
      >
        <Alert
          onClose={() => setNoSubmissionAlertOpen(false)}
          severity="warning"
          sx={{ width: "100%" }}
        >
          The student has not submitted yet. Cannot update grade.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AssignmentComponent;