"use client"
import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, TextField, Button, Box } from '@mui/material';

export default function Dashboard() {
  const [courseDetails, setCourseDetails] = useState([]);
  const [editRowId, setEditRowId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    courseName: '',
    courseCode: '',
    sectionName: '',
    instructorName: '',
    instructorEmail: ''
  });
  const [newCourseData, setNewCourseData] = useState({
    courseName: '',
    courseCode: '',
    sectionName: '',
    instructorName: '',
    instructorEmail: ''
  });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard/admin/edit/course');
        const data = await response.json();
        setCourseDetails(data.courseDetails);
        console.log(data.courseDetails);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();  
  }, []);

  const handleEditClick = (course) => {
    setEditRowId(course.sectionID);
    setEditFormData({
      courseName: course.courseName,
      courseCode: course.courseCode,
      sectionName: course.sectionName,
      instructorName: course.instructorName,
      instructorEmail: course.instructorEmail
    });
  };

  const handleSaveClick = (sectionID) => {
    if (window.confirm("Are you sure you want to save the changes?")) {
      // Implement save functionality
      const updatedCourses = courseDetails.map((course) =>
        course.sectionID === sectionID ? { ...course, ...editFormData } : course
      );
      setCourseDetails(updatedCourses);
      setEditRowId(null);
      setIsAdding(false);
    }
  };

  const handleCancelClick = () => {
    setEditRowId(null);
    setIsAdding(false);
  };

  const handleDeleteClick = (sectionID) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      // Implement delete functionality
      setCourseDetails(courseDetails.filter(course => course.sectionID !== sectionID));
      setIsAdding(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleNewInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourseData({ ...newCourseData, [name]: value });
  };

  const handleAddClick = () => {
    if (isAdding) {
      alert("Please fill out the new course details before adding another.");
      return;
    }
    // Implement add functionality
    const newCourse = {
      sectionID: courseDetails.length + 1, // Generate a new ID
      ...newCourseData
    };
    setCourseDetails([...courseDetails, newCourse]);
    setNewCourseData({
      courseName: '',
      courseCode: '',
      sectionName: '',
      instructorName: '',
      instructorEmail: ''
    });
    setIsAdding(true);
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Box mb={2}>
        <Typography variant="h6" gutterBottom>
          Add New Course
        </Typography>
        <TextField
          label="Course Name"
          name="courseName"
          value={newCourseData.courseName}
          onChange={handleNewInputChange}
          style={{ marginRight: 8 }}
        />
        <TextField
          label="Course Code"
          name="courseCode"
          value={newCourseData.courseCode}
          onChange={handleNewInputChange}
          style={{ marginRight: 8 }}
        />
        <TextField
          label="Section"
          name="sectionName"
          value={newCourseData.sectionName}
          onChange={handleNewInputChange}
          style={{ marginRight: 8 }}
        />
        <TextField
          label="Instructor Name"
          name="instructorName"
          value={newCourseData.instructorName}
          onChange={handleNewInputChange}
          style={{ marginRight: 8 }}
        />
        <TextField
          label="Instructor Email"
          name="instructorEmail"
          value={newCourseData.instructorEmail}
          onChange={handleNewInputChange}
          style={{ marginRight: 8 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddClick}
        >
          Add
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Course Name</TableCell>
              <TableCell>Course Code</TableCell>
              <TableCell>Section</TableCell>
              <TableCell>Instructor</TableCell>
              <TableCell>Instructor Email</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courseDetails.map((course) => (
              <TableRow key={course.sectionID}>
                {editRowId === course.sectionID ? (
                  <>
                    <TableCell>
                      <TextField
                        name="courseName"
                        value={editFormData.courseName}
                        onChange={handleInputChange}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        name="courseCode"
                        value={editFormData.courseCode}
                        onChange={handleInputChange}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        name="sectionName"
                        value={editFormData.sectionName}
                        onChange={handleInputChange}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        name="instructorName"
                        value={editFormData.instructorName}
                        onChange={handleInputChange}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        name="instructorEmail"
                        value={editFormData.instructorEmail}
                        onChange={handleInputChange}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleSaveClick(course.sectionID)}
                      >
                        Save
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={handleCancelClick}
                        style={{ marginLeft: 8 }}
                      >
                        Cancel
                      </Button>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{course.courseName}</TableCell>
                    <TableCell>{course.courseCode}</TableCell>
                    <TableCell>{course.sectionName}</TableCell>
                    <TableCell>{course.instructorName}</TableCell>
                    <TableCell>{course.instructorEmail}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleEditClick(course)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={() => handleDeleteClick(course.sectionID)}
                        style={{ marginLeft: 8 }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}