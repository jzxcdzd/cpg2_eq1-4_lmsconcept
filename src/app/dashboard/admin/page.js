// page.js
"use client";
import { useEffect, useState } from "react";
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
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  

  useEffect(() => {
    fetchInitialData();
  }, []);

    const fetchInitialData = async () => {
    try {
      const res = await fetch("/api/dashboard/admin/");
      const data = await res.json();
      if (res.ok) {
        setCourses(data.courses);
        setInstructors(data.instructors);
        setStudents(data.students); // Add this line
        setSections(data.sections); // Add this line
      } else {
        showSnackbar(data.error || "Failed to fetch initial data.", "error");
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      showSnackbar("An unexpected error occurred.", "error");
    }
  };

    const addOptions = [
    { label: "Add New Course", color: "primary", type: "course" },
    { label: "Assign Sections & Instructors", color: "primary", type: "sections" },
    { label: "Add New Student", color: "primary", type: "student" },
    { label: "Add New Instructor", color: "primary", type: "instructor" },
    { label: "Assign Student to Section", color: "primary", type: "assignStudent" },
  ];

    const [dialogState, setDialogState] = useState({
    course: false,
    sections: false,
    student: false,
    instructor: false,
    assignStudent: false, // Add this
  });
  
  const [newEntry, setNewEntry] = useState({
    course: { courseName: "", courseCode: "", description: "" },
    sections: { courseID: "", section: "", instructorID: "" },
    student: { firstName: "", lastName: "", email: "", bio: "", birthday: "" },
    instructor: { firstName: "", lastName: "", email: "" },
    assignStudent: { studentID: "", courseID: "", sectionID: "" },
  });

  // Handlers for Dialogs
  const handleOpenDialog = (type) => {
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
      [type]: { ...prev[type], [name]: value },
    }));
  };

  const handleSubmit = async (type) => {
    const dataToSend = newEntry[type];

    // Validation
  const isValid = Object.values(dataToSend).every(
    (field) => field.toString().trim() !== ""
  );
  if (!isValid) {
    showSnackbar("All fields are required.", "error");
    return;
  }

  let action = "";
  switch (type) {
    case "course":
      action = "addCourse";
      break;
    case "sections":
      action = "assignSections";
      break;
    case "student":
      action = "addStudent";
      break;
    case "instructor":
      action = "addInstructor";
      break;
      case "assignStudent":
        action = "assignStudent";
        break;
      default:
        return;
    }
  
    try {
      const response = await fetch("/api/dashboard/admin/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, data: dataToSend }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        showSnackbar(`${capitalize(type)} added successfully!`, "success");
        handleCloseDialog(type);
        fetchInitialData(); // Refresh data
      } else {
        showSnackbar(data.error || `Failed to add ${type}.`, "error");
      }
    } catch (error) {
      console.error("Error on submit:", error);
      showSnackbar("An unexpected error occurred.", "error");
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Utility function to capitalize first letter
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
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

              {/* Add Dialogs Based on Type */}
              {renderDialog(option.type)}
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

  function renderDialog(type) {
    switch (type) {
      case "course":
        return (
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
        );
        case "sections":
      return (
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
              {/* Course Selection */}
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
                  <MenuItem key={course.courseID} value={course.courseID}>
                    {course.name}
                  </MenuItem>
                ))}
              </TextField>

              {/* Section Name Input */}
              <TextField
                label="Section Name"
                name="section"
                value={newEntry.sections.section}
                onChange={(e) => handleChange("sections", e)}
                fullWidth
                required
              />

              {/* Instructor Selection */}
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
                    {`${instructor.firstName} ${instructor.lastName}`}
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
      );
      case "student":
        return (
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
                <TextField
                  label="Birthday"
                  name="birthday"
                  type="date"
                  value={newEntry.student.birthday}
                  onChange={(e) => handleChange("student", e)}
                  fullWidth
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
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
        );
      case "instructor":
        return (
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
        );

        case "assignStudent":
      // Filter sections based on selected courseID
      const filteredSections = sections.filter(
        (section) => section.courseID === newEntry.assignStudent.courseID
      );

      return (
        <Dialog
          open={dialogState.assignStudent}
          onClose={() => handleCloseDialog("assignStudent")}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Assign Student to Course and Section</DialogTitle>
          <DialogContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                marginTop: 1,
              }}
            >
              {/* Student Selection */}
              <TextField
                select
                label="Student"
                name="studentID"
                value={newEntry.assignStudent.studentID}
                onChange={(e) => handleChange("assignStudent", e)}
                fullWidth
                required
              >
                {students.map((student) => (
                  <MenuItem
                    key={student.studentID}
                    value={student.studentID}
                  >
                    {`${student.firstName} ${student.lastName}`}
                  </MenuItem>
                ))}
              </TextField>

              {/* Course Selection */}
              <TextField
                select
                label="Course"
                name="courseID"
                value={newEntry.assignStudent.courseID}
                onChange={(e) => handleChange("assignStudent", e)}
                fullWidth
                required
              >
                {courses.map((course) => (
                  <MenuItem key={course.courseID} value={course.courseID}>
                    {course.name}
                  </MenuItem>
                ))}
              </TextField>

              {/* Section Selection */}
              <TextField
                select
                label="Section"
                name="sectionID"
                value={newEntry.assignStudent.sectionID}
                onChange={(e) => handleChange("assignStudent", e)}
                fullWidth
                required
                disabled={!newEntry.assignStudent.courseID} // Disable until course is selected
              >
                {filteredSections.map((section) => (
                  <MenuItem
                    key={section.sectionID}
                    value={section.sectionID}
                  >
                    {section.section}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => handleCloseDialog("assignStudent")}
              color="secondary"
              startIcon={<CancelIcon />}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleSubmit("assignStudent")}
              color="primary"
              variant="contained"
              startIcon={<SaveIcon />}
            >
              Assign Student
            </Button>
          </DialogActions>
        </Dialog>
      );

      default:
        return null;
    }
  }
}