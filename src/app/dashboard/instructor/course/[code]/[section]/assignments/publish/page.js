"use client"
import { Assignment } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import AddAssignmentPane from './assignment';

export default function assignment() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetch('/api/posts')
        const response = await data.json()
        setPosts(response.posts)
        console.log(response)
      } catch (error) {
        console.log(error)
      }
    };

    fetchData();  
  }, []);

  return (
    <>
          <AddAssignmentPane /></>
  );
}