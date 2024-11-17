"use client"
import { useEffect, useState } from 'react';

export default function courseAssignments() {
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

    // Essentially andito dapat yung component elements, like nakawrap sila

    <div>
      <h1> Course Assignments page </h1>
    </div>
  );
}