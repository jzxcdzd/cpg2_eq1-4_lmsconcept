"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { TextField, Button, Box, Typography } from '@mui/material';

export default function AddAssignment() {
  const params = useParams();
  const [courseDetails, setCourseDetails] = useState([]);
  const [code, setCode] = useState('');
  const [section, setSection] = useState('');
  const [assignmentName, setAssignmentName] = useState('');
  const [assignmentDescription, setAssignmentDescription] = useState('');
  const [assignmentSubmissionDate, setAssignmentSubmissionDate] = useState('');
  const [grade, setGrade] = useState('');

  useEffect(() => {
    const unwrapParams = async () => {
      const unwrappedParams = await params;
      setCode(unwrappedParams.code);
      setSection(unwrappedParams.section);
    };

    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (code && section) {
      const fetchData = async () => {
        try {
          const response = await fetch(`/api/course/${code}/${section}`);
          const data = await response.json();
          console.log("API Response:", data.courseDetails);
          setCourseDetails(data.courseDetails || []);
        } catch (error) {
          console.log(error);
        }
      };

      fetchData();
    }
  }, [code, section]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const assignmentData = {
      assignmentName,
      assignmentDescription,
      assignmentSubmissionDate,
      grade,
    };
    console.log('Assignment Data:', assignmentData);

    // TO-DO: API calls here to submit the assignment data
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        mt: 3,
        backgroundColor: 'black',
        color: 'white',
        padding: 3,
        borderRadius: 2,
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ color: 'white' }}>
        Publish an Assignment
      </Typography>
      {courseDetails.length > 0 ? (
        courseDetails.map((detail, index) => (
          <div key={index}>
            <Typography variant="h5" gutterBottom sx={{ color: 'white' }}>
              [{detail.courseCode} - {detail.sectionName}] {detail.courseName}
            </Typography>
          </div>
        ))
      ) : (
        <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
          No course details found.
        </Typography>
      )}
      <TextField
        label="Assignment Name"
        value={assignmentName}
        onChange={(e) => setAssignmentName(e.target.value)}
        fullWidth
        margin="normal"
        InputLabelProps={{ style: { color: 'white' } }}
        InputProps={{ style: { color: 'white' } }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'white',
            },
            '&:hover fieldset': {
              borderColor: 'white',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'white',
            },
          },
        }}
      />
      <TextField
        label="Assignment Description"
        value={assignmentDescription}
        onChange={(e) => setAssignmentDescription(e.target.value)}
        fullWidth
        margin="normal"
        multiline
        rows={4}
        InputLabelProps={{ style: { color: 'white' } }}
        InputProps={{ style: { color: 'white' } }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'white',
            },
            '&:hover fieldset': {
              borderColor: 'white',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'white',
            },
          },
        }}
      />
      <TextField
        label="Submission Date"
        type="date"
        value={assignmentSubmissionDate}
        onChange={(e) => setAssignmentSubmissionDate(e.target.value)}
        fullWidth
        margin="normal"
        InputLabelProps={{
          shrink: true,
          style: { color: 'white' },
        }}
        InputProps={{ style: { color: 'white' } }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'white',
            },
            '&:hover fieldset': {
              borderColor: 'white',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'white',
            },
          },
        }}
      />
      <TextField
        label="Grade"
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
        fullWidth
        margin="normal"
        InputLabelProps={{ style: { color: 'white' } }}
        InputProps={{ style: { color: 'white' } }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'white',
            },
            '&:hover fieldset': {
              borderColor: 'white',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'white',
            },
          },
        }}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{ mt: 2, backgroundColor: 'white', color: 'black' }}
      >
        Publish Assignment
      </Button>
    </Box>
  );
}