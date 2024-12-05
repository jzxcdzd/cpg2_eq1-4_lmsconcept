// NavigationBar.js
"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Box } from "@mui/material";

const NavigationBar = () => {
  const { instructorID } = useParams();

  // Construct dynamic routes based on parameters
  const courseDashboardLink = `/dashboard/instructor/${instructorID}/`;

  return (
    <AppBar position="static" sx={{ backgroundColor: "#333", paddingY: 1 }}>
      <Toolbar>
        {/* Application Title */}
        <Typography
          variant="h5"
          component="div"
          sx={{ flexGrow: 1, fontSize: "1.8rem", fontWeight: "bold" }}
        >
          DLSU
        </Typography>

        {/* Navigation Buttons */}
        <Box>
          <Button
            color="inherit"
            component={Link}
            href={courseDashboardLink}
            sx={{
              textTransform: "none",
              fontSize: "1.2rem",
              marginRight: 3,
              borderBottom: courseDashboardLink ? "3px solid #fff" : "none",
              "&:hover": {
                borderBottom: "3px solid #fff",
              },
            }}
          >
            Course Dashboard
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;