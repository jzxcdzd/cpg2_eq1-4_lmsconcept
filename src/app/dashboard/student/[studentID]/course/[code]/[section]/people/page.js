"use client"
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function CoursePeople() {
  const params = useParams();
  const [students, setStudents] = useState([]);
  const [code, setCode] = useState('');
  const [section, setSection] = useState('');

  useEffect(() => {
    const unwrapParams = async () => {
      const unwrappedParams = await params;
      setCode(unwrappedParams.code);
      setSection(unwrappedParams.section);
    };

    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (code && section) {
      const fetchData = async () => {
        try {
          const response = await fetch(`/api/course/${code}/${section}/students`);
          const data = await response.json();
          console.log("API Response:", data.students); 
          setStudents(data.students || []);
        } catch (error) {
          console.log(error);
        }
      };

      fetchData();
    }
  }, [code, section]);

  return (
    <div>
      <h1>Course People Page</h1>
      <h2>Course Code: {code}</h2>
      <h2>Section: {section}</h2>
      <ul>
        {Array.isArray(students) && students.map((student, index) => (
          <li key={index}>{student.firstName} {student.lastName} {section} </li>
        ))}
      </ul>
    </div>
  );
}