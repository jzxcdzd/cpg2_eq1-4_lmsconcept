"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Box, Typography, List, ListItem, Link } from "@mui/material";

const LessonComponent = () => {
  const { instructorID, code, section } = useParams(); // Get the parameters from the route
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch lessons based on the route
    const fetchLessonData = async () => {
      try {
        const response = await fetch(`/api/dashboard/instructor/${instructorID}/course/${code}/${section}`);
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
      <Typography variant="body1" sx={{ color: "#fff" }}>
        No lessons found for the specified course.
      </Typography>
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
              <Typography variant="h6" sx={{ marginRight: 1 }}>
                {lessonName}
              </Typography>
              {groupedLessons[lessonName].map((lesson, idx) => (
                <Box key={idx} sx={{ marginTop: 1 }}>
                  {lesson.type === "Presentation" || lesson.type === "Assignment" ? (
                    <Link href={lesson.content} target="_blank" rel="noopener" variant="body2" sx={{ color: "#4caf50" }}>
                      {lesson.content}
                    </Link>
                  ) : (
                    <Typography variant="body2">
                      Content: {lesson.content}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default LessonComponent;