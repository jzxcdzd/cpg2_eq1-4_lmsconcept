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
  MenuItem,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

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
    type: "",
    content: "",
    link: "",
  });
  const [addContentDialogOpen, setAddContentDialogOpen] = useState(false);
  const [currentLesson, setCurrentLesson] = useState({
    lessonName: "",
    orderIndex: "",
  });
  const [newContent, setNewContent] = useState({
    type: "",
    content: "",
    link: "",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState(null);

  // New states for deleting entire lessons
  const [deleteLessonDialogOpen, setDeleteLessonDialogOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState(null);

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
        setAlertOpen(true);
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
    const { lessonName, type, content, link } = newLesson;

    if (!lessonName || !type || !content) {
      alert("Lesson Name, Type, and Content are required to add a new lesson.");
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
              type,
              content,
              link: type === "Presentation" ? link : null,
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
          type: "",
          content: "",
          link: "",
        });
        setAlertOpen(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddDialogClose = () => {
    setAddDialogOpen(false);
    setNewLesson({
      lessonName: "",
      type: "",
      content: "",
      link: "",
    });
  };

  // Add Content Handlers
  const handleAddContentClick = (lessonName, orderIndex) => {
    setCurrentLesson({ lessonName, orderIndex });
    setAddContentDialogOpen(true);
  };

  const handleAddContentChange = (e) => {
    const { name, value } = e.target;
    setNewContent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddContentSubmit = async () => {
    const { type, content, link } = newContent;
    const { lessonName, orderIndex } = currentLesson;

    if (!type || !content) {
      alert("Type and Content are required to add new content.");
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
            action: "addContent",
            lessonName,
            orderIndex: parseInt(orderIndex, 10),
            type,
            content,
            link: type === "Presentation" ? link : null,
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
        setAddContentDialogOpen(false);
        setNewContent({
          type: "",
          content: "",
          link: "",
        });
        setAlertOpen(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddContentDialogClose = () => {
    setAddContentDialogOpen(false);
    setCurrentLesson({ lessonName: "", orderIndex: "" });
    setNewContent({
      type: "",
      content: "",
      link: "",
    });
  };

  // Delete Content Handlers
  const handleDeleteContentClick = (lessonName, orderIndex, type, content) => {
    setContentToDelete({ lessonName, orderIndex, type, content });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    const { lessonName, orderIndex, type, content } = contentToDelete;

    try {
      const response = await fetch(
        `/api/dashboard/instructor/${instructorID}/course/${code}/${section}/lessons`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "delete",
            lessonName,
            orderIndex,
            type,
            content,
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
        setDeleteDialogOpen(false);
        setContentToDelete(null);
        setAlertOpen(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setContentToDelete(null);
  };

  // New Handlers for Deleting Entire Lesson
  const handleDeleteLessonClick = (lessonName) => {
    setLessonToDelete(lessonName);
    setDeleteLessonDialogOpen(true);
  };

  const handleDeleteLessonConfirm = async () => {
    const lessonName = lessonToDelete;

    try {
      const response = await fetch(
        `/api/dashboard/instructor/${instructorID}/course/${code}/${section}/lessons`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "deleteLesson",
            lessonName,
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
        setDeleteLessonDialogOpen(false);
        setLessonToDelete(null);
        setAlertOpen(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteLessonCancel = () => {
    setDeleteLessonDialogOpen(false);
    setLessonToDelete(null);
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
      <Box>
        <Typography variant="body1" sx={{ color: "#fff" }}>
          No lessons found for the specified course.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddLessonClick}
          sx={{ marginTop: 2 }}
        >
          Add Lesson
        </Button>

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
              select
              label="Type"
              name="type"
              value={newLesson.type}
              onChange={handleAddLessonChange}
              fullWidth
              margin="normal"
            >
              <MenuItem value="Presentation">Presentation</MenuItem>
              <MenuItem value="Discussion">Discussion</MenuItem>
              <MenuItem value="Assignment">Assignment</MenuItem>
            </TextField>
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
            {newLesson.type === "Presentation" && (
              <TextField
                label="Link"
                name="link"
                value={newLesson.link}
                onChange={handleAddLessonChange}
                fullWidth
                margin="normal"
                helperText="Enter the URL for the presentation link."
              />
            )}
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
      </Box>
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
                <Box display="flex" alignItems="center" gap={1}>
                  <IconButton
                    onClick={() =>
                      handleAddContentClick(
                        lessonName,
                        groupedLessons[lessonName][0].orderIndex
                      )
                    }
                    sx={{ color: "#fff" }}
                    title="Add Content"
                  >
                    <AddIcon />
                  </IconButton>
                  {editMode[lessonName] ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        onClick={() => handleSaveClick(lessonName)}
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
                      <IconButton
                        onClick={() => handleDeleteLessonClick(lessonName)}
                        sx={{ color: "#f44336" }}
                        title="Delete Lesson"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconButton
                        onClick={() => handleEditClick(lessonName)}
                        sx={{ color: "#fff" }}
                        title="Edit Lesson"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteLessonClick(lessonName)}
                        sx={{ color: "#f44336" }}
                        title="Delete Lesson"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </Box>
              {groupedLessons[lessonName].map((lesson, idx) => (
                <Box key={idx} sx={{ marginTop: 1 }}>
                  {editMode[lessonName] ? (
                    <>
                      <Box
                        sx={{
                          border: "1px solid #555",
                          borderRadius: 1,
                          padding: 2,
                          backgroundColor: "#2c2c2c",
                        }}
                      >
                        <TextField
                          select
                          label="Type"
                          name="type"
                          value={editedLessons[lessonName][idx].type}
                          onChange={(e) =>
                            handleChange(lessonName, idx, "type", e.target.value)
                          }
                          fullWidth
                          margin="normal"
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
                        >
                          <MenuItem value="Presentation">Presentation</MenuItem>
                          <MenuItem value="Discussion">Discussion</MenuItem>
                          <MenuItem value="Assignment">Assignment</MenuItem>
                        </TextField>
                        <TextField
                          label="Content"
                          name="content"
                          value={editedLessons[lessonName][idx].content}
                          onChange={(e) =>
                            handleChange(lessonName, idx, "content", e.target.value)
                          }
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
                        {editedLessons[lessonName][idx].type === "Presentation" && (
                          <TextField
                            label="Link"
                            name="link"
                            value={editedLessons[lessonName][idx].link || ""}
                            onChange={(e) =>
                              handleChange(lessonName, idx, "link", e.target.value)
                            }
                            fullWidth
                            margin="normal"
                            helperText="Enter the URL for the presentation link."
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
                        )}
                        <IconButton
                          onClick={() =>
                            handleDeleteContentClick(
                              lesson.lessonName,
                              lesson.orderIndex,
                              lesson.type,
                              lesson.content
                            )
                          }
                          sx={{ color: "#f44336", marginTop: 1 }}
                          title="Delete Content"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Divider sx={{ marginY: 2, backgroundColor: "#555" }} />
                    </>
                  ) : (
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      {lesson.type === "Presentation" && lesson.link ? (
                        <Typography variant="body2">
                          <a
                            href={lesson.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#1e90ff", textDecoration: "underline" }}
                          >
                            {lesson.content}
                          </a>
                        </Typography>
                      ) : (
                        <Typography variant="body2">{lesson.content}</Typography>
                      )}
                      {/* Remove the Delete IconButton here */}
                    </Box>
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
            select
            label="Type"
            name="type"
            value={newLesson.type}
            onChange={handleAddLessonChange}
            fullWidth
            margin="normal"
          >
            <MenuItem value="Presentation">Presentation</MenuItem>
            <MenuItem value="Discussion">Discussion</MenuItem>
            <MenuItem value="Assignment">Assignment</MenuItem>
          </TextField>
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
          {newLesson.type === "Presentation" && (
            <TextField
              label="Link"
              name="link"
              value={newLesson.link}
              onChange={handleAddLessonChange}
              fullWidth
              margin="normal"
              helperText="Enter the URL for the presentation link."
            />
          )}
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

      {/* Add Content Dialog */}
      <Dialog open={addContentDialogOpen} onClose={handleAddContentDialogClose}>
        <DialogTitle>Add New Content</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Lesson: {currentLesson.lessonName}
          </Typography>
          <TextField
            label="Type"
            name="type"
            value={newContent.type}
            onChange={handleAddContentChange}
            select
            fullWidth
            margin="normal"
          >
            <MenuItem value="Presentation">Presentation</MenuItem>
            <MenuItem value="Discussion">Discussion</MenuItem>
            <MenuItem value="Assignment">Assignment</MenuItem>
          </TextField>
          <TextField
            label="Content"
            name="content"
            value={newContent.content}
            onChange={handleAddContentChange}
            fullWidth
            margin="normal"
            multiline
            rows={4}
          />
          {newContent.type === "Presentation" && (
            <TextField
              label="Link (Optional)"
              name="link"
              value={newContent.link}
              onChange={handleAddContentChange}
              fullWidth
              margin="normal"
              helperText="Enter the URL for the presentation link."
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddContentDialogClose} color="secondary" startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button onClick={handleAddContentSubmit} color="primary" startIcon={<SaveIcon />}>
            Add Content
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog for Content */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Content</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this content?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="secondary" startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="primary" startIcon={<DeleteIcon />}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog for Lesson */}
      <Dialog open={deleteLessonDialogOpen} onClose={handleDeleteLessonCancel}>
        <DialogTitle>Delete Lesson</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the entire lesson "{lessonToDelete}"? This will remove all associated content.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteLessonCancel} color="secondary" startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button onClick={handleDeleteLessonConfirm} color="primary" startIcon={<DeleteIcon />}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={alertOpen} autoHideDuration={6000} onClose={handleAlertClose}>
        <Alert onClose={handleAlertClose} severity="success" sx={{ width: "100%" }}>
          Action completed successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LessonComponent;