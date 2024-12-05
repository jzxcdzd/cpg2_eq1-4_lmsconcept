// page.js
"use client";

import { useEffect, useState } from 'react';
import NavigationBar from "../NavigationBar";
import { useParams } from 'next/navigation';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from '@mui/material';

export default function CoursePeople() {
  const params = useParams();
  const [students, setStudents] = useState([]);
  
  const [studentID, setStudentID] = useState('');
  const [code, setCode] = useState('');
  const [section, setSection] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract studentID, course code, and section from URL parameters
  useEffect(() => {
    const unwrapParams = async () => {
      const unwrappedParams = await params;
      setStudentID(unwrappedParams.studentID);
      setCode(unwrappedParams.code);
      setSection(unwrappedParams.section);
    };

    unwrapParams();
  }, [params]);

  // Fetch students data when studentID, code, and section are set
  useEffect(() => {
    if (studentID && code && section) {
      const fetchData = async () => {
        setLoading(true);
        try {
          // Fetch from the specified API route
          const response = await fetch(`/api/dashboard/student/${studentID}/course/${code}/${section}/people`);
          
          if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log("API Response:", data.students); 
          setStudents(data.students || []);
        } catch (error) {
          console.error("Fetch Error:", error);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [studentID, code, section]);

  // Display a loading indicator while fetching data
  if (loading) {
    return (
      <Box sx={{ padding: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Display an error message if the fetch fails
  if (error) {
    return (
      <Box sx={{ padding: 4 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <><NavigationBar /><Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Course People Page
      </Typography>
      <Typography variant="h6">
        Course Code: {code}
      </Typography>
      <Typography variant="h6" gutterBottom>
        Section: {section}
      </Typography>

      {/* Table to display student details */}
      <TableContainer component={Paper} sx={{ marginTop: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Student ID</strong></TableCell>
              <TableCell><strong>First Name</strong></TableCell>
              <TableCell><strong>Last Name</strong></TableCell>
              <TableCell><strong>Section</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.studentID}>
                <TableCell>{student.studentID}</TableCell>
                <TableCell>{student.firstName}</TableCell>
                <TableCell>{student.lastName}</TableCell>
                <TableCell>{section}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box></>
  );
}