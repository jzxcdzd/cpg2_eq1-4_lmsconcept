"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function CourseDetails() {
  const params = useParams();
  const [courseDetails, setCourseDetails] = useState([]);
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
          const response = await fetch(`/api/course/${code}/${section}`);
          const data = await response.json();
          console.log("API Response:", data.courseDetails); 
          setCourseDetails(data.courseDetails || []);
        } catch (error) {
          console.log(error);
        }
      };

      fetchData();
    }
  }, [code, section]);

  return (
    <div>
      {courseDetails.length > 0 ? (
        courseDetails.map((detail, index) => (
          <div key={index}>
            <h2> [{detail.courseCode} - {detail.sectionName}] {detail.courseName} </h2>
            <p>{detail.instructorFirstName} {detail.instructorLastName}</p>
            <p>{detail.instructorEmail}</p>
            <p>{detail.courseDescription}</p>
          </div>
        ))
      ) : (
        <p>No course details found.</p>
      )}
    </div>
  );
}