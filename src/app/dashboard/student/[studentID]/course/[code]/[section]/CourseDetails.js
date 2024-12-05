// CourseDetails.js
"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Box, Typography, Paper, Snackbar, Alert } from '@mui/material';

function CourseDetails() {
  const params = useParams();
  const [courseDetails, setCourseDetails] = useState(null);
  const [code, setCode] = useState('');
  const [section, setSection] = useState('');
  const [studentID, setStudentID] = useState('');
  const [error, setError] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);

  useEffect(() => {
    const unwrapParams = async () => {
      const unwrappedParams = await params;
      setCode(unwrappedParams.code);
      setSection(unwrappedParams.section);
      setStudentID(unwrappedParams.studentID);
    };

    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (code && section && studentID) {
      const fetchData = async () => {
        try {
          const response = await fetch(`/api/dashboard/student/${studentID}/course/${code}/${section}`);
          const data = await response.json();
          console.log("API Response:", data); // Debugging statement
          if (data.error) {
            setError(data.error);
          } else {
            setCourseDetails(data.courseDetails || null);
          }
        } catch (error) {
          console.log(error);
          setError("Failed to fetch course details.");
        }
      };

      fetchData();
    }
  }, [studentID, code, section]);

  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  return (
    <Box sx={{ padding: "2rem", backgroundColor: "#000", color: "#fff" }}>
      {courseDetails ? (
        <Paper elevation={3} sx={{ padding: "2rem", backgroundColor: "#1e1e1e", color: "#fff" }}>
          <Typography variant="h4" gutterBottom>
            [{courseDetails.courseCode} - {courseDetails.sectionName}] {courseDetails.courseName}
          </Typography>
          <Box mt={2}>
            <Typography variant="h6" gutterBottom>
              Instructor
            </Typography>
            <Typography variant="body1">
              {courseDetails.instructorFirstName} {courseDetails.instructorLastName}
            </Typography>
            <Typography variant="body1">{courseDetails.instructorEmail}</Typography>
          </Box>
          <Box mt={2}>
            <Typography variant="h6" gutterBottom>
              Course Description
            </Typography>
            <Typography variant="body1">{courseDetails.courseDescription}</Typography>
          </Box>
        </Paper>
      ) : (
        <Typography variant="body1" sx={{ color: error ? "red" : "#fff" }}>
          {error ? error : "No course details found."}
        </Typography>
      )}
      <Snackbar open={alertOpen} autoHideDuration={6000} onClose={handleAlertClose}>
        <Alert onClose={handleAlertClose} severity="success" sx={{ width: '100%' }}>
          Course details loaded successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default CourseDetails;