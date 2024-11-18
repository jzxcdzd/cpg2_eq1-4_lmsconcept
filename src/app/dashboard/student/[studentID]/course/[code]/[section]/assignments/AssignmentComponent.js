import React from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const AssignmentComponent = ({
  assignmentName,
  assignmentDueDate,
  submissionLink,
  grade,
  isSubmitted,
  handleSubmit,
}) => {
  const [link, setLink] = React.useState(submissionLink || "");

  const onSubmit = () => {
    handleSubmit(link);
  };

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
        {assignmentName}
      </Typography>
      <Typography variant="body2" gutterBottom>
        Due: {assignmentDueDate}
      </Typography>
      {isSubmitted ? (
        <Box display="flex" alignItems="center" gap={1}>
          <CheckCircleIcon color="success" />
          <Typography>Submitted!</Typography>
        </Box>
      ) : (
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            label="Submission Link"
            variant="outlined"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            sx={{ backgroundColor: "#fff", borderRadius: 1 }}
          />
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#ff9800", // Orange color
              color: "#000",
              '&:hover': {
                backgroundColor: "#e68900", // Darker orange on hover
              },
            }}
            onClick={onSubmit}
            disabled={!link}
          >
            Submit
          </Button>
        </Box>
      )}
      <Typography variant="body2" gutterBottom>
        Grade: {grade !== null ? `${grade}/100` : "Not Yet Graded"}
      </Typography>
    </Box>
  );
};

export default AssignmentComponent;