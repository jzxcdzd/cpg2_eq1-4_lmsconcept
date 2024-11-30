"use client";
import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, Link } from '@mui/material';
import { useParams } from 'next/navigation';

const CourseCard = ({ course }) => {
  const { instructorID } = useParams();

  return (
    <Card sx={{ minWidth: 275, margin: "1rem", backgroundColor: "#f5f5f5" }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          <Link href={`/dashboard/instructor/${instructorID}/course/${course.courseCode}/${course.sectionName}`} color="inherit" underline="hover">
            {course.courseName} ({course.courseCode})
          </Link>
        </Typography>   
        <Box mt={2}>
          <Typography variant="subtitle2">Section: {course.sectionName}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

// Main Component to Fetch and Display Courses
const Courses = () => {
  const params = useParams();
  const [courseDetails, setCourseDetails] = useState([]);
  const [instructorID, setInstructorID] = useState('');

  useEffect(() => {
    const unwrapParams = async () => {
      const unwrappedParams = await params;
      setInstructorID(unwrappedParams.instructorID);
    };

    unwrapParams();
  }, [params]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`/api/dashboard/instructor/${instructorID}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setCourseDetails(data.courseDetails);
        //console.log("API Response:", data.courseDetails);
      } catch (error) {
        //console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, [instructorID]);

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