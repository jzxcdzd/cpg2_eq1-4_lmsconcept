"use client"
import { useEffect, useState } from 'react';
import Courses from './CourseCard';
import NavigationInitial from './NavigationInitial';

export default function dashboard() {
  return (

    // Essentially andito dapat yung component elements, like nakawrap sila

    <div>
      <NavigationInitial />
      <Courses />
    </div>
  );
  
}

