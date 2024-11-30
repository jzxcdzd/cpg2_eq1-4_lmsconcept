// CourseDetails.js
"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Box, Typography, Paper, IconButton, TextField, Button, Snackbar, Alert } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

function CourseDetails() {
  const params = useParams();
  const [courseDetails, setCourseDetails] = useState(null);
  const [code, setCode] = useState('');
  const [section, setSection] = useState('');
  const [instructorID, setInstructorID] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editedDetails, setEditedDetails] = useState({});
  const [alertOpen, setAlertOpen] = useState(false);

  useEffect(() => {
    const unwrapParams = async () => {
      const unwrappedParams = await params;
      setCode(unwrappedParams.code);
      setSection(unwrappedParams.section);
      setInstructorID(unwrappedParams.instructorID);
    };

    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (code && section && instructorID) {
      const fetchData = async () => {
        try {
          const response = await fetch(`/api/dashboard/instructor/${instructorID}/course/${code}/${section}`);
          const data = await response.json();
          console.log("API Response:", data); // Debugging statement
          setCourseDetails(data.courseDetails || null);
          setEditedDetails(data.courseDetails || {});
        } catch (error) {
          console.log(error);
        }
      };

      fetchData();
    }
  }, [instructorID, code, section]);

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleSaveClick = async () => {
    try {
      const response = await fetch(`/api/dashboard/instructor/${instructorID}/course/${code}/${section}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseDescription: editedDetails.courseDescription }),
      });
      const data = await response.json();
      if (data.error) {
        console.error(data.error);
      } else {
        setCourseDetails(data.courseDetails);
        setEditMode(false);
        setAlertOpen(true); // Show alert
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCancelClick = () => {
    setEditedDetails(courseDetails);
    setEditMode(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  return (
    <Box sx={{ padding: "2rem", backgroundColor: "#000", color: "#fff" }}>
      {courseDetails ? (
        <Paper elevation={3} sx={{ padding: "2rem", backgroundColor: "#1e1e1e", color: "#fff" }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h4" gutterBottom>
              [{courseDetails.courseCode} - {courseDetails.sectionName}] {courseDetails.courseName}
            </Typography>
            <IconButton onClick={handleEditClick} sx={{ color: "#fff" }}>
              <EditIcon />
            </IconButton>
          </Box>
          {editMode ? (
            <Box>
              <TextField
                label="Course Description"
                name="courseDescription"
                value={editedDetails.courseDescription}
                onChange={handleChange}
                fullWidth
                margin="normal"
                multiline
                rows={4}
                sx={{
                  backgroundColor: "#000",
                  '& .MuiInputBase-input': {
                    color: "#fff",
                  },
                  '& .MuiInputLabel-root': {
                    color: "#fff",
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#fff',
                    },
                    '&:hover fieldset': {
                      borderColor: '#fff',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#fff',
                    },
                  },
                }}
              />
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveClick}
                  sx={{ marginRight: 1 }}
                >
                  Save
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<CancelIcon />}
                  onClick={handleCancelClick}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            <Box>
              <Typography variant="body1">
                {courseDetails.instructorFirstName} {courseDetails.instructorLastName}
              </Typography>
              <Typography variant="body1">{courseDetails.instructorEmail}</Typography>
              <Typography variant="body1">{courseDetails.courseDescription}</Typography>
            </Box>
          )}
        </Paper>
      ) : (
        <Typography variant="body1">No course details found.</Typography>
      )}
      <Snackbar open={alertOpen} autoHideDuration={6000} onClose={handleAlertClose}>
        <Alert onClose={handleAlertClose} severity="success" sx={{ width: '100%' }}>
          Course description updated successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default CourseDetails;