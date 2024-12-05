"use client"
import { useEffect, useState } from 'react';
import Courses from './CourseCard';
import NavigationInitial from './NavigationInitial';

export default function dashboard() {
  return (
    <><NavigationInitial /><div style={{ backgroundColor: '#000', color: '#1E90FF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, padding: '2rem' }}>
        <Courses />
      </div>
      <footer style={{ padding: '1rem', backgroundColor: '#000', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid #333' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', fontSize: '0.8rem' }}>
          <a href="#" style={{ margin: '0 1rem', color: '#1E90FF' }}>Privacy Policy</a>
          <a href="#" style={{ margin: '0 1rem', color: '#1E90FF' }}>Cookie Notice</a>
          <a href="#" style={{ margin: '0 1rem', color: '#1E90FF' }}>Acceptable Use Policy</a>
          <a href="#" style={{ margin: '0 1rem', color: '#1E90FF' }}>Facebook</a>
          <a href="#" style={{ margin: '0 1rem', color: '#1E90FF' }}>Instagram</a>
        </div>
      </footer>
    </div></>
  );
}