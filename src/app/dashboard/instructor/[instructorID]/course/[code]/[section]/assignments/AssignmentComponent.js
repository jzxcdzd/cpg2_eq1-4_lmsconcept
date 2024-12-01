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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

const AssignmentComponent = () => {
  const { instructorID, code, section } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState({});
  const [editedAssignments, setEditedAssignments] = useState({});
  const [alertOpen, setAlertOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("add"); // 'add' or 'edit'
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [newAssignment, setNewAssignment] = useState({
    assignmentID: "",
    name: "",
    description: "",
    dueDate: "",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);

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

  const handleOpenDialog = (type, assignment = null) => {
    setDialogType(type);
    if (type === "edit" && assignment) {
      setCurrentAssignment(assignment);
      setNewAssignment({
        assignmentID: assignment.assignmentID,
        name: assignment.name || assignment.assignmentName,
        description: assignment.description || assignment.assignmentDescription,
        dueDate: assignment.dueDate || assignment.assignmentDueDate,
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
    setCurrentAssignment(null);
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
    try {
      const response = await fetch(
        `/api/dashboard/instructor/${instructorID}/course/${code}/${section}/assignments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "add",
            newAssignment: newAssignment,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text(); // Capture the full response text
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
    // Leave this function blank
  };

  const handleDeleteAssignment = async () => {
    // Leave this function blank
  };

  const handleDeleteClick = (assignment) => {
    setAssignmentToDelete(assignment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAssignmentToDelete(null);
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
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
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
            <ListItem key={index} sx={{ padding: 0 }}>
              <Box
                sx={{
                  border: "1px solid #4caf50",
                  borderRadius: 2,
                  padding: 2,
                  marginBottom: 2,
                  backgroundColor: "#1e1e1e",
                  color: "#fff",
                  width: "100%",
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6" sx={{ marginRight: 1 }}>
                    {assignment.name || assignment.assignmentName}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <IconButton
                      onClick={() => handleOpenDialog("edit", assignment)}
                      sx={{ color: "#fff" }}
                      title="Edit Assignment"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteClick(assignment)}
                      sx={{ color: "#f44336" }}
                      title="Delete Assignment"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="body1" color="inherit">
                  Due Date:{" "}
                  {new Date(
                    assignment.dueDate || assignment.assignmentDueDate
                  ).toLocaleString()}
                </Typography>
                <Typography variant="body1">
                  {assignment.description || assignment.assignmentDescription}
                </Typography>
              </Box>
            </ListItem>
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
          <Button onClick={handleCloseDialog} color="secondary" startIcon={<CancelIcon />}>
            Cancel
          </Button>
          {dialogType === "add" ? (
            <Button onClick={handleAddAssignment} color="primary" startIcon={<SaveIcon />}>
              Add
            </Button>
          ) : (
            <Button onClick={handleEditAssignment} color="primary" startIcon={<SaveIcon />}>
              Save
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Assignment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the assignment "{assignmentToDelete?.name || assignmentToDelete?.assignmentName}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="secondary" startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button onClick={handleDeleteAssignment} color="primary" startIcon={<DeleteIcon />}>
            Delete
          </Button>
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
    </Box>
  );
};

export default AssignmentComponent;