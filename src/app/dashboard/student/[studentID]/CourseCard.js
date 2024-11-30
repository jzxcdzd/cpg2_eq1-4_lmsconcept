"use client";
import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, Link } from '@mui/material';
import { useParams } from 'next/navigation';

const CourseCard = ({ course }) => {
  const { studentID } = useParams();

  return (
    <Card sx={{ minWidth: 275, margin: "1rem", backgroundColor: "#f5f5f5", display: 'flex', flexDirection: 'column', height: 200 }}>
      <Box sx={{ height: '50%', backgroundColor: course.color }} />
      <CardContent sx={{ height: '50%' }}>
        <Typography variant="h6" component="div" gutterBottom sx={{ color: course.color }}>
          <Link href={`/dashboard/student/${studentID}/course/${course.courseCode}/${course.sectionName}`} color="inherit" underline="hover">
            {course.courseName} ({course.courseCode})
          </Link>
        </Typography>   
        <Box mt={1}>
          <Typography variant="subtitle2">Section: {course.sectionName}</Typography>
          <Typography variant="subtitle2">Instructor: {course.instructorFirstName} {course.instructorLastName}</Typography>
          <Typography variant="subtitle2">Email: {course.instructorEmail}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

// Main Component to Fetch and Display Courses
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
          color: `hsl(${index * 60}, 70%, 50%)` // Generate a unique color for each course
        }));
        setCourseDetails(coursesWithColors);
      } catch (error) {
        //console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, [studentID]);

  return (
    <Box sx={{ padding: "2rem" }}>
      <Typography variant="h4" gutterBottom>
        Courses
      </Typography>
      <Grid container spacing={2}>
        {courseDetails.map((course) => (
          <Grid item key={`${course.courseCode}-${course.sectionName}`} xs={12} sm={6} md={4}>
            <CourseCard course={course} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Courses;