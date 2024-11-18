import React from "react";
import { Box, Typography, Link, List, ListItem } from "@mui/material";

const LessonComponent = ({ lessonTitle, presentationLink, details }) => {
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
      <Typography variant="h6" gutterBottom>
        {lessonTitle}
      </Typography>
      <List sx={{ padding: 0 }}>
        <ListItem sx={{ padding: 0 }}>
          <Link
            href={presentationLink}
            target="_blank"
            rel="noopener"
            underline="hover"
            sx={{ color: "#4caf50" }}
          >
            Presentation Slides ↓
          </Link>
        </ListItem>
        {details.map((item, index) => (
          <ListItem key={index} sx={{ padding: 0 }}>
            {item.type === "link" ? (
              <Link
                href={item.href}
                target="_blank"
                rel="noopener"
                underline="hover"
                sx={{ color: "#4caf50" }}
              >
                {item.text}
              </Link>
            ) : (
              <Typography variant="body2">{item.text}</Typography>
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default LessonComponent;
