"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

function CourseDetails() {
  const params = useParams();
  const [courseDetails, setCourseDetails] = useState([]);
  const [code, setCode] = useState('');
  const [section, setSection] = useState('');
  const [studentID, setstudentID] = useState('');

  useEffect(() => {
    const unwrapParams = async () => {
      const unwrappedParams = await params;
      setCode(unwrappedParams.code);
      setSection(unwrappedParams.section);
      setstudentID(unwrappedParams.studentID);
    };

    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (code && section && studentID) {
      const fetchData = async () => {
        try {
          const response = await fetch(`/api/dashboard/student/${studentID}/course/${code}/${section}`);
          const data = await response.json();
          console.log("API Response:", data.courseDetails); 
          setCourseDetails(data.courseDetails || []);
        } catch (error) {
          console.log(error);
        }
      };

      fetchData();
    }
  }, [studentID, code, section]);

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

export default CourseDetails;