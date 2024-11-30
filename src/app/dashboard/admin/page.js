// page.js
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
    const fetchInitialCourses = async () => {
      try {
        const res = await fetch("/api/dashboard/admin/courses/");
        const data = await res.json();
        if (res.ok) {
          setCourses(data.courses);
        } else {
          setSnackbarMessage(data.message || "Failed to fetch courses.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        }
      } catch (error) {
        console.log("Error fetching courses:", error);
        setSnackbarMessage("An unexpected error occurred.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };

    fetchInitialCourses();
  }, []);

  const addOptions = [
    {
      label: "Add New Course",
      color: "primary",
      type: "course",
    },
    {
      label: "Assign Sections & Instructors",
      color: "primary",
      type: "sections",
    },
    {
      label: "Add New Student",
      color: "primary",
      type: "student",
    },
    {
      label: "Add New Instructor",
      color: "primary",
      type: "instructor",
    },
  ];

  const modifyOptions = [
    {
      href: "/dashboard/admin/modify-courses",
      label: "Modify Courses",
      color: "secondary",
    },
    {
      href: "/dashboard/admin/modify-students",
      label: "Modify Students",
      color: "secondary",
    },
    {
      href: "/dashboard/admin/modify-instructors",
      label: "Modify Instructors",
      color: "secondary",
    },
  ];

  // State for Add Dialogs
  const [dialogState, setDialogState] = useState({
    course: false,
    sections: false,
    student: false,
    instructor: false,
  });

  // State for new entries
  const [newEntry, setNewEntry] = useState({
    course: { courseName: "", courseCode: "", description: "" },
    sections: { courseID: "", sectionName: "", instructorID: "" },
    student: { firstName: "", lastName: "", email: "", bio: "", birthday: "" },
    instructor: { firstName: "", lastName: "", email: "" },
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Handlers for Dialogs
  const handleOpenDialog = async (type) => {
    if (type === "sections") {
      try {
        const res = await fetch("/api/dashboard/admin/assign/");
        const data = await res.json();
        if (res.ok) {
          setCourses(data.courses);
          setInstructors(data.instructors);
        } else {
          setSnackbarMessage(data.error || "Failed to fetch assignment data.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        }
      } catch (error) {
        console.log("Error fetching assignment data:", error);
        setSnackbarMessage("An unexpected error occurred.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    }

    setDialogState((prev) => ({ ...prev, [type]: true }));
  };

  const handleCloseDialog = (type) => {
    setDialogState((prev) => ({ ...prev, [type]: false }));
    setNewEntry((prev) => ({
      ...prev,
      [type]: Object.keys(prev[type]).reduce((acc, key) => {
        acc[key] = "";
        return acc;
      }, {}),
    }));
  };

  const handleChange = (type, e) => {
    const { name, value } = e.target;
    setNewEntry((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (type) => {
    const dataToSend = newEntry[type];

    // Validation
    const isValid = Object.values(dataToSend).every(
      (field) => field.toString().trim() !== ""
    );
    if (!isValid) {
      setSnackbarMessage("All fields are required.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    let apiEndpoint = "";
    switch (type) {
      case "course":
        apiEndpoint = "/api/dashboard/admin/courses/";
        break;
      case "sections":
        apiEndpoint = "/api/dashboard/admin/assign/";
        break;
      case "student":
        apiEndpoint = "/api/dashboard/admin/students/";
        break;
      case "instructor":
        apiEndpoint = "/api/dashboard/admin/instructors/";
        break;
      default:
        return;
    }

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbarMessage(`${capitalize(type)} added successfully!`);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        handleCloseDialog(type);

        // Refresh relevant data
        if (type === "course") {
          const res = await fetch("/api/dashboard/admin/courses/");
          const updatedCourses = await res.json();
          if (res.ok) {
            setCourses(updatedCourses.courses);
          }
        }

        if (type === "sections") {
          const res = await fetch("/api/dashboard/admin/assign/");
          const updatedData = await res.json();
          if (res.ok) {
            setCourses(updatedData.courses);
            setInstructors(updatedData.instructors);
          }
        }

        if (type === "student") {
          const res = await fetch("/api/dashboard/admin/students/");
          const updatedStudents = await res.json();
          if (res.ok) {
            setStudents(updatedStudents.students);
          }
        }

        if (type === "instructor") {
          const res = await fetch("/api/dashboard/admin/instructors/");
          const updatedInstructors = await res.json();
          if (res.ok) {
            setInstructors(updatedInstructors.instructors);
          }
        }
        
      } else {
        setSnackbarMessage(data.error || `Failed to add ${type}.`);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.log(error);
      setSnackbarMessage("An unexpected error occurred.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Utility function to capitalize first letter
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Fancy seeing you here, admin
      </Typography>

      {/* Add Functions Section */}
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant="h5" gutterBottom>
          Add Functions
        </Typography>
        <Grid container spacing={2}>
          {addOptions.map((option, index) => (
            <Grid item key={index} xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                color={option.color}
                sx={{
                  width: "100%",
                  height: "100%",
                  fontSize: "1.2rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 2,
                }}
                onClick={() => handleOpenDialog(option.type)}
                startIcon={<AddIcon />}
              >
                {option.label}
              </Button>

              {/* Add Dialogs */}
              {/* Add Course Dialog */}
              {option.type === "course" && (
                <Dialog
                  open={dialogState.course}
                  onClose={() => handleCloseDialog("course")}
                  fullWidth
                  maxWidth="sm"
                >
                  <DialogTitle>Add New Course</DialogTitle>
                  <DialogContent>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        marginTop: 1,
                      }}
                    >
                      <TextField
                        label="Course Name"
                        name="courseName"
                        value={newEntry.course.courseName}
                        onChange={(e) => handleChange("course", e)}
                        fullWidth
                        required
                      />
                      <TextField
                        label="Course Code"
                        name="courseCode"
                        value={newEntry.course.courseCode}
                        onChange={(e) => handleChange("course", e)}
                        fullWidth
                        required
                      />
                      <TextField
                        label="Description"
                        name="description"
                        value={newEntry.course.description}
                        onChange={(e) => handleChange("course", e)}
                        fullWidth
                        required
                        multiline
                        rows={4}
                      />
                    </Box>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={() => handleCloseDialog("course")}
                      color="secondary"
                      startIcon={<CancelIcon />}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleSubmit("course")}
                      color="primary"
                      variant="contained"
                      startIcon={<SaveIcon />}
                    >
                      Add Course
                    </Button>
                  </DialogActions>
                </Dialog>
              )}

              {/* Assign Sections & Instructors Dialog */}
              {option.type === "sections" && (
                <Dialog
                  open={dialogState.sections}
                  onClose={() => handleCloseDialog("sections")}
                  fullWidth
                  maxWidth="sm"
                >
                  <DialogTitle>Assign Sections & Instructors</DialogTitle>
                  <DialogContent>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        marginTop: 1,
                      }}
                    >
                      <TextField
                        select
                        label="Course"
                        name="courseID"
                        value={newEntry.sections.courseID}
                        onChange={(e) => handleChange("sections", e)}
                        fullWidth
                        required
                      >
                        {courses.map((course) => (
                          <MenuItem
                            key={course.courseID}
                            value={course.courseID}
                          >
                            {course.courseName}
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        label="Section Name"
                        name="sectionName"
                        value={newEntry.sections.sectionName}
                        onChange={(e) => handleChange("sections", e)}
                        fullWidth
                        required
                      />
                      <TextField
                        select
                        label="Instructor"
                        name="instructorID"
                        value={newEntry.sections.instructorID}
                        onChange={(e) => handleChange("sections", e)}
                        fullWidth
                        required
                      >
                        {instructors.map((instructor) => (
                          <MenuItem
                            key={instructor.instructorID}
                            value={instructor.instructorID}
                          >
                            {instructor.firstName} {instructor.lastName}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={() => handleCloseDialog("sections")}
                      color="secondary"
                      startIcon={<CancelIcon />}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleSubmit("sections")}
                      color="primary"
                      variant="contained"
                      startIcon={<SaveIcon />}
                    >
                      Assign Section
                    </Button>
                  </DialogActions>
                </Dialog>
              )}

              {/* Add Student Dialog */}
              {option.type === "student" && (
                <Dialog
                  open={dialogState.student}
                  onClose={() => handleCloseDialog("student")}
                  fullWidth
                  maxWidth="sm"
                >
                  <DialogTitle>Add New Student</DialogTitle>
                  <DialogContent>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        marginTop: 1,
                      }}
                    >
                      <TextField
                        label="First Name"
                        name="firstName"
                        value={newEntry.student.firstName}
                        onChange={(e) => handleChange("student", e)}
                        fullWidth
                        required
                      />
                      <TextField
                        label="Last Name"
                        name="lastName"
                        value={newEntry.student.lastName}
                        onChange={(e) => handleChange("student", e)}
                        fullWidth
                        required
                      />
                      <TextField
                        label="Email"
                        name="email"
                        value={newEntry.student.email}
                        onChange={(e) => handleChange("student", e)}
                        fullWidth
                        required
                        type="email"
                      />
                      <TextField
                        label="Bio"
                        name="bio"
                        value={newEntry.student.bio}
                        onChange={(e) => handleChange("student", e)}
                        fullWidth
                        required
                        multiline
                        rows={3}
                      />
                    </Box>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={() => handleCloseDialog("student")}
                      color="secondary"
                      startIcon={<CancelIcon />}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleSubmit("student")}
                      color="primary"
                      variant="contained"
                      startIcon={<SaveIcon />}
                    >
                      Add Student
                    </Button>
                  </DialogActions>
                </Dialog>
              )}

              {/* Add Instructor Dialog */}
              {option.type === "instructor" && (
                <Dialog
                  open={dialogState.instructor}
                  onClose={() => handleCloseDialog("instructor")}
                  fullWidth
                  maxWidth="sm"
                >
                  <DialogTitle>Add New Instructor</DialogTitle>
                  <DialogContent>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        marginTop: 1,
                      }}
                    >
                      <TextField
                        label="First Name"
                        name="firstName"
                        value={newEntry.instructor.firstName}
                        onChange={(e) => handleChange("instructor", e)}
                        fullWidth
                        required
                      />
                      <TextField
                        label="Last Name"
                        name="lastName"
                        value={newEntry.instructor.lastName}
                        onChange={(e) => handleChange("instructor", e)}
                        fullWidth
                        required
                      />
                      <TextField
                        label="Email"
                        name="email"
                        value={newEntry.instructor.email}
                        onChange={(e) => handleChange("instructor", e)}
                        fullWidth
                        required
                        type="email"
                      />
                    </Box>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={() => handleCloseDialog("instructor")}
                      color="secondary"
                      startIcon={<CancelIcon />}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleSubmit("instructor")}
                      color="primary"
                      variant="contained"
                      startIcon={<SaveIcon />}
                    >
                      Add Instructor
                    </Button>
                  </DialogActions>
                </Dialog>
              )}
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}