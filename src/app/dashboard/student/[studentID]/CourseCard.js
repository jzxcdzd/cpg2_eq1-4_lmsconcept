// CourseCard.js
"use client";
import { useEffect, useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Link, 
  Button, 
  Menu, 
  MenuItem, 
  Snackbar, 
  Alert 
} from '@mui/material';
import { useParams } from 'next/navigation';

const lightenColor = (color, percent) => {
  const num = parseInt(color.replace("#",""),16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = (num >> 8 & 0x00FF) + amt,
        B = (num & 0x0000FF) + amt;
  return `#${(
    0x1000000 + 
    (R<255?R<1?0:R:255)*0x10000 + 
    (G<255?G<1?0:G:255)*0x100 + 
    (B<255?B<1?0:B:255)
  ).toString(16).slice(1)}`;
};

const CourseCard = ({ course, onDrop }) => {
  const { studentID } = useParams();
  const [anchorEl, setAnchorEl] = useState(null);
  const [bgColor, setBgColor] = useState(course.color);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeColor = (color) => {
    setBgColor(color);
    handleClose();
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  const dropCourse = async () => {
    try {
      const response = await fetch(`/api/dashboard/student/${studentID}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentID: studentID,
          sectionID: course.sectionID,
        }),
      });

      if (response.ok) {
        alert("Course dropped successfully.");
        setSnackbarMessage('Course dropped successfully.');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        onDrop(course.courseID);
      } else {
        const errorData = await response.json();
        setSnackbarMessage(errorData.error || 'Failed to drop course.');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    } catch (error) {
      setSnackbarMessage('An error occurred while dropping the course.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      console.error("Error dropping course:", error);
    } finally {
      handleClose();
    }
  };

  const hoverColor = lightenColor(bgColor, 20);

  return (
    <>
      <Card
        sx={{
          minWidth: 275,
          margin: "1rem",
          display: 'flex',
          flexDirection: 'column',
          height: 250,
          position: 'relative',
        }}
      >
        <Button
          variant="contained"
          size="small"
          sx={{ 
            position: 'absolute', 
            top: 8, 
            right: 8, 
            borderRadius: '50%',
            width: 40,
            height: 40,
            padding: 0,
            minWidth: 0,
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: hoverColor,
            },
          }}
          onClick={handleClick}
        >
          ☰
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
        >
          <MenuItem onClick={() => changeColor(course.color)}>Default Color</MenuItem>
          <MenuItem onClick={() => changeColor('#ff0000')}>Red</MenuItem>
          <MenuItem onClick={() => changeColor('#00ff00')}>Green</MenuItem>
          <MenuItem onClick={() => changeColor('#0000ff')}>Blue</MenuItem>
          <MenuItem onClick={() => changeColor('#ff9900')}>Orange</MenuItem>
          <MenuItem onClick={() => changeColor('#9900ff')}>Purple</MenuItem>
          <MenuItem onClick={() => changeColor('#00ffff')}>Cyan</MenuItem>
          <MenuItem onClick={() => changeColor('#ffff00')}>Yellow</MenuItem>
          <MenuItem onClick={() => changeColor('#808080')}>Grey</MenuItem>
          <MenuItem onClick={dropCourse}>Drop Course</MenuItem>
        </Menu>
        {/* Colored Upper Half */}
        <Box sx={{ height: '50%', backgroundColor: bgColor }} />

        {/* Card Content Lower Half */}
        <CardContent
          sx={{
            height: '50%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {/* Course Title */}
          <Typography
            variant="h6"
            component="div"
            gutterBottom
            sx={{
              color: bgColor,
              fontSize: '1.2rem',
            }}
          >
            <Link
              href={`/dashboard/student/${studentID}/course/${course.courseCode}/${course.sectionName}`}
              color="inherit"
              underline="hover"
            >
              {course.courseName}
            </Link>
          </Typography>
    
          <Typography
            variant="subtitle2" sx={{
              fontSize: '1rem',
            }}
          >
            {course.courseCode} - {course.sectionName}
          </Typography>
  
          <Box mt={1}>
            <Typography variant="subtitle2">
              Instructor: {course.instructorFirstName} {course.instructorLastName}
            </Typography>
          </Box>
        </CardContent>
      </Card>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

const Courses = () => {
  const params = useParams();
  const [courseDetails, setCourseDetails] = useState([]);
  const [studentID, setStudentID] = useState('');

  useEffect(() => {
    const unwrapParams = async () => {
      const unwrappedParams = await params;
      setStudentID(unwrappedParams.studentID);
    };

    unwrapParams();
  }, [params]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`/api/dashboard/student/${studentID}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        // Add a unique color to each course
        const coursesWithColors = data.courseDetails.map((course, index) => ({
          ...course,
          color: `hsl(${index * 30}, 70%, 80%)`,
        }));
        setCourseDetails(coursesWithColors);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    if (studentID) {
      fetchCourses();
    }
  }, [studentID]);

  const removeCourse = (courseID) => {
    setCourseDetails(prevCourses => prevCourses.filter(course => course.courseID !== courseID));
  };

  return (
    <Box sx={{ padding: "2rem" }}>
      <Typography variant="h4" gutterBottom>
        Courses
      </Typography>
      <Grid container spacing={2}>
        {courseDetails.map((course) => (
          <Grid item key={`${course.courseCode}-${course.sectionID}`} xs={12} sm={6} md={4}>
            <CourseCard course={course} onDrop={removeCourse} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Courses;