// LessonComponent.js
"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Box, Typography, Link, List, ListItem, Divider } from "@mui/material";

const LessonComponent = () => {
  const { studentID, code, section } = useParams();
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        const response = await fetch(
          `/api/dashboard/student/${studentID}/course/${code}/${section}/lessons`
        );
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

    if (studentID && code && section) {
      fetchLessonData();
    }
  }, [studentID, code, section]);

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
      <Typography variant="h5" gutterBottom>
        Lessons
      </Typography>
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
              <Typography variant="h6" sx={{ marginBottom: 1 }}>
                {lessonName}
              </Typography>
              {groupedLessons[lessonName].map((lesson, idx) => (
                <Box key={idx} sx={{ marginTop: 1 }}>
                  {lesson.type === "Presentation" && lesson.link ? (
                    <Typography variant="body2">
                      <Link
                        href={lesson.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="hover"
                        sx={{ color: "#4caf50" }}
                      >
                        {lesson.content}
                      </Link>
                    </Typography>
                  ) : (
                    <Typography variant="body2">{lesson.content}</Typography>
                  )}
                  <Divider sx={{ marginY: 1, backgroundColor: "#555" }} />
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