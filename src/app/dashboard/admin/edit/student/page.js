"use client"
import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, TextField, Button, Box } from '@mui/material';

export default function Dashboard() {
  const [studentDetails, setStudentDetails] = useState([]);
  const [editRowId, setEditRowId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    birthday: ''
  });
  const [newStudentData, setNewStudentData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    birthday: ''
  });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard/admin/edit/student');
        const data = await response.json();
        setStudentDetails(data.studentDetails);
        console.log(data.studentDetails);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();  
  }, []);

  const handleEditClick = (student) => {
    setEditRowId(student.studentID);
    setEditFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      bio: student.bio,
      birthday: student.birthday
    });
  };

  const handleSaveClick = (studentID) => {
    if (window.confirm("Are you sure you want to save the changes?")) {
      // Implement save functionality
      const updatedStudents = studentDetails.map((student) =>
        student.studentID === studentID ? { ...student, ...editFormData } : student
      );
      setStudentDetails(updatedStudents);
      setEditRowId(null);
      setIsAdding(false);
    }
  };

  const handleCancelClick = () => {
    setEditRowId(null);
    setIsAdding(false);
  };

  const handleDeleteClick = (studentID) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      // Implement delete functionality
      setStudentDetails(studentDetails.filter(student => student.studentID !== studentID));
      setIsAdding(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleNewInputChange = (e) => {
    const { name, value } = e.target;
    setNewStudentData({ ...newStudentData, [name]: value });
  };

  const handleAddClick = () => {
    if (isAdding) {
      alert("Please fill out the new student details before adding another.");
      return;
    }
    // Implement add functionality
    const newStudent = {
      studentID: studentDetails.length + 1, // Generate a new ID
      ...newStudentData
    };
    setStudentDetails([...studentDetails, newStudent]);
    setNewStudentData({
      firstName: '',
      lastName: '',
      email: '',
      bio: '',
      birthday: ''
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
          Add New Student
        </Typography>
        <TextField
          label="First Name"
          name="firstName"
          value={newStudentData.firstName}
          onChange={handleNewInputChange}
          style={{ marginRight: 8 }}
        />
        <TextField
          label="Last Name"
          name="lastName"
          value={newStudentData.lastName}
          onChange={handleNewInputChange}
          style={{ marginRight: 8 }}
        />
        <TextField
          label="Email"
          name="email"
          value={newStudentData.email}
          onChange={handleNewInputChange}
          style={{ marginRight: 8 }}
        />
        <TextField
          label="Bio"
          name="bio"
          value={newStudentData.bio}
          onChange={handleNewInputChange}
          style={{ marginRight: 8 }}
        />
        <TextField
          label="Birthday"
          name="birthday"
          value={newStudentData.birthday}
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
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Bio</TableCell>
              <TableCell>Birthday</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {studentDetails.map((student) => (
              <TableRow key={student.studentID}>
                {editRowId === student.studentID ? (
                  <>
                    <TableCell>
                      <TextField
                        name="firstName"
                        value={editFormData.firstName}
                        onChange={handleInputChange}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        name="lastName"
                        value={editFormData.lastName}
                        onChange={handleInputChange}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        name="email"
                        value={editFormData.email}
                        onChange={handleInputChange}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        name="bio"
                        value={editFormData.bio}
                        onChange={handleInputChange}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        name="birthday"
                        value={editFormData.birthday}
                        onChange={handleInputChange}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleSaveClick(student.studentID)}
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
                    <TableCell>{student.firstName}</TableCell>
                    <TableCell>{student.lastName}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.bio}</TableCell>
                    <TableCell>{student.birthday}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleEditClick(student)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={() => handleDeleteClick(student.studentID)}
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