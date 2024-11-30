// LessonComponent.js
"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Typography,
  List,
  ListItem,
  TextField,
  Button,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";

const LessonComponent = () => {
  const { instructorID, code, section } = useParams();
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState({});
  const [editedLessons, setEditedLessons] = useState({});
  const [alertOpen, setAlertOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newLesson, setNewLesson] = useState({
    lessonName: "",
    orderIndex: "",
    type: "",
    content: "",
  });

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        const response = await fetch(
          `/api/dashboard/instructor/${instructorID}/course/${code}/${section}/lessons`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch lessons: ${response.statusText}`);
        }
        const data = await response.json();
        setLessonData(data);
      } catch (err) {
        console.error("Error fetching lessons:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [instructorID, code, section]);

  const handleEditClick = (lessonName) => {
    setEditMode((prev) => ({ ...prev, [lessonName]: true }));
    setEditedLessons((prev) => ({
      ...prev,
      [lessonName]: lessonData.lessons.filter(
        (lesson) => lesson.lessonName === lessonName
      ),
    }));
  };

  const handleSaveClick = async (lessonName) => {
    try {
      const lessonsToUpdate = editedLessons[lessonName].map((lesson) => ({
        ...lesson,
      }));

      const response = await fetch(
        `/api/dashboard/instructor/${instructorID}/course/${code}/${section}/lessons`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "update", lessons: lessonsToUpdate }),
        }
      );
      const data = await response.json();
      if (data.error) {
        console.error(data.error);
      } else {
        setLessonData((prev) => ({
          ...prev,
          lessons: data.lessons,
        }));
        setEditMode((prev) => ({ ...prev, [lessonName]: false }));
        setAlertOpen(true); // Show alert
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCancelClick = (lessonName) => {
    setEditMode((prev) => ({ ...prev, [lessonName]: false }));
    setEditedLessons((prev) => ({
      ...prev,
      [lessonName]: lessonData.lessons.filter(
        (lesson) => lesson.lessonName === lessonName
      ),
    }));
  };

  const handleChange = (lessonName, idx, field, value) => {
    setEditedLessons((prev) => ({
      ...prev,
      [lessonName]: prev[lessonName].map((lesson, i) =>
        i === idx ? { ...lesson, [field]: value } : lesson
      ),
    }));
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  // Add Lesson Handlers
  const handleAddLessonClick = () => {
    setAddDialogOpen(true);
  };

  const handleAddLessonChange = (e) => {
    const { name, value } = e.target;
    setNewLesson((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddLessonSubmit = async () => {
    const { lessonName, orderIndex, type, content } = newLesson;

    if (!lessonName || !orderIndex || !type || !content) {
      alert("All fields are required to add a new lesson.");
      return;
    }

    try {
      const response = await fetch(
        `/api/dashboard/instructor/${instructorID}/course/${code}/${section}/lessons`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "add",
            newLesson: {
              lessonName,
              orderIndex: parseInt(orderIndex, 10),
              type,
              content,
            },
          }),
        }
      );

      const data = await response.json();
      if (data.error) {
        console.error(data.error);
      } else {
        setLessonData((prev) => ({
          ...prev,
          lessons: data.lessons,
        }));
        setAddDialogOpen(false);
        setNewLesson({
          lessonName: "",
          orderIndex: "",
          type: "",
          content: "",
        });
        setAlertOpen(true); // Show alert
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddDialogClose = () => {
    setAddDialogOpen(false);
    setNewLesson({
      lessonName: "",
      orderIndex: "",
      type: "",
      content: "",
    });
  };

  if (loading) {
    return (
      <Typography variant="body1" sx={{ color: "#fff" }}>
        Loading...
      </Typography>
    );
  }

  if (error) {
    return (
      <Typography variant="body1" sx={{ color: "red" }}>
        {error}
      </Typography>
    );
  }

  if (!lessonData || lessonData.lessons.length === 0) {
    return (
      <Typography variant="body1" sx={{ color: "#fff" }}>
        No lessons found for the specified course.
      </Typography>
    );
  }

  // Group lessons by lessonName
  const groupedLessons = lessonData.lessons.reduce((acc, lesson) => {
    if (!acc[lesson.lessonName]) {
      acc[lesson.lessonName] = [];
    }
    acc[lesson.lessonName].push(lesson);
    return acc;
  }, {});

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
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" gutterBottom>
          Lessons for {lessonData.courseDetails.courseName}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddLessonClick}
        >
          Add Lesson
        </Button>
      </Box>
      <List sx={{ padding: 0 }}>
        {Object.keys(groupedLessons).map((lessonName, index) => (
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
                  {lessonName}
                </Typography>
                {editMode[lessonName] ? (
                  <Box>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={() => handleSaveClick(lessonName)}
                      sx={{ marginRight: 1 }}
                    >
                      Save
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<CancelIcon />}
                      onClick={() => handleCancelClick(lessonName)}
                    >
                      Cancel
                    </Button>
                  </Box>
                ) : (
                  <IconButton onClick={() => handleEditClick(lessonName)} sx={{ color: "#fff" }}>
                    <EditIcon />
                  </IconButton>
                )}
              </Box>
              {groupedLessons[lessonName].map((lesson, idx) => (
                <Box key={idx} sx={{ marginTop: 1 }}>
                  {editMode[lessonName] ? (
                    <TextField
                      label="Content"
                      value={editedLessons[lessonName][idx].content}
                      onChange={(e) => handleChange(lessonName, idx, "content", e.target.value)}
                      fullWidth
                      margin="normal"
                      multiline
                      rows={2}
                      sx={{
                        backgroundColor: "#000",
                        "& .MuiInputBase-input": {
                          color: "#fff",
                        },
                        "& .MuiInputLabel-root": {
                          color: "#fff",
                        },
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "#fff",
                          },
                          "&:hover fieldset": {
                            borderColor: "#fff",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#fff",
                          },
                        },
                      }}
                    />
                  ) : (
                    <Typography variant="body2">{lesson.content}</Typography>
                  )}
                </Box>
              ))}
            </Box>
          </ListItem>
        ))}
      </List>

      {/* Add Lesson Dialog */}
      <Dialog open={addDialogOpen} onClose={handleAddDialogClose}>
        <DialogTitle>Add New Lesson</DialogTitle>
        <DialogContent>
          <TextField
            label="Lesson Name"
            name="lessonName"
            value={newLesson.lessonName}
            onChange={handleAddLessonChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Order Index"
            name="orderIndex"
            type="number"
            value={newLesson.orderIndex}
            onChange={handleAddLessonChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Type"
            name="type"
            value={newLesson.type}
            onChange={handleAddLessonChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Content"
            name="content"
            value={newLesson.content}
            onChange={handleAddLessonChange}
            fullWidth
            margin="normal"
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddDialogClose} color="secondary" startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button onClick={handleAddLessonSubmit} color="primary" startIcon={<SaveIcon />}>
            Add Lesson
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={alertOpen} autoHideDuration={6000} onClose={handleAlertClose}>
        <Alert onClose={handleAlertClose} severity="success" sx={{ width: "100%" }}>
          Lesson content updated successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LessonComponent;