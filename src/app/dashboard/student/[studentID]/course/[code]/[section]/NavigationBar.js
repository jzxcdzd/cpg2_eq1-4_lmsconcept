// NavigationBar.js
"use client";

import React from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Box } from "@mui/material";

const NavigationBar = () => {
  const { studentID, code, section } = useParams();
  const pathname = usePathname();

  // Construct dynamic routes based on parameters
  const courseDashboardLink = `/dashboard/student/${studentID}/`;
  const dashboardLink = `/dashboard/student/${studentID}/course/${code}/${section}`;
  const assignmentsLink = `/dashboard/student/${studentID}/course/${code}/${section}/assignments`;
  const peopleLink = `/dashboard/student/${studentID}/course/${code}/${section}/people`;
  const logoutLink = "/";

  // Function to determine if a link is active
  const isActive = (link) => pathname === link;

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Button
            color="inherit"
            component={Link}
            href={courseDashboardLink}
            sx={{
              textTransform: "none",
              fontSize: "1.2rem",
              borderBottom: isActive(courseDashboardLink) ? "3px solid #fff" : "none",
              "&:hover": {
                borderBottom: "3px solid #fff",
              },
            }}
          >
            Course Dashboard
          </Button>
          <Button
            color="inherit"
            component={Link}
            href={dashboardLink}
            sx={{
              textTransform: "none",
              fontSize: "1.2rem",
              borderBottom: isActive(dashboardLink) ? "3px solid #fff" : "none",
              "&:hover": {
                borderBottom: "3px solid #fff",
              },
            }}
          >
            Dashboard
          </Button>
          <Button
            color="inherit"
            component={Link}
            href={assignmentsLink}
            sx={{
              textTransform: "none",
              fontSize: "1.2rem",
              borderBottom: isActive(assignmentsLink) ? "3px solid #fff" : "none",
              "&:hover": {
                borderBottom: "3px solid #fff",
              },
            }}
          >
            Assignments
          </Button>
          <Button
            color="inherit"
            component={Link}
            href={peopleLink}
            sx={{
              textTransform: "none",
              fontSize: "1.2rem",
              borderBottom: isActive(peopleLink) ? "3px solid #fff" : "none",
              "&:hover": {
                borderBottom: "3px solid #fff",
              },
            }}
          >
            People
          </Button>
          {/* Logout Button */}
          <Button
            color="inherit"
            component={Link}
            href={logoutLink}
            sx={{
              textTransform: "none",
              fontSize: "1.2rem",
              borderBottom: "none",
              "&:hover": {
                borderBottom: "none",
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;