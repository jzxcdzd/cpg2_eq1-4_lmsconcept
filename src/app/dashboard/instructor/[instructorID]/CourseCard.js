// CourseCard.js
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
          <Link
            href={`/dashboard/instructor/${instructorID}/course/${course.courseCode}/${course.sectionName}`}
            color="inherit"
            underline="hover"
          >
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
  const { instructorID } = params; // Destructure directly without awaiting
  const [courseDetails, setCourseDetails] = useState([]);

  useEffect(() => {
    if (!instructorID) return; // Ensure instructorID is available
    const fetchCourses = async () => {
      try {
        const response = await fetch(`/api/dashboard/instructor/${instructorID}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();

        // Ensure courseDetails is an array
        if (Array.isArray(data.courseDetails)) {
          setCourseDetails(data.courseDetails);
        } else if (data.courseDetails) {
          setCourseDetails([data.courseDetails]); // Wrap object in array
        } else {
          setCourseDetails([]); // Set to empty array if undefined
        }

        console.log("API Response:", data.courseDetails);
      } catch (error) {
        console.error("Error fetching courses:", error);
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
        {courseDetails.length > 0 ? (
          courseDetails.map((course) => (
            <Grid item key={`${course.courseCode}-${course.sectionName}`} xs={12} sm={6} md={4}>
              <CourseCard course={course} />
            </Grid>
          ))
        ) : (
          <Typography variant="body1" sx={{ color: "#fff", marginTop: "1rem" }}>
            No courses available.
          </Typography>
        )}
      </Grid>
    </Box>
  );
};

export default Courses;