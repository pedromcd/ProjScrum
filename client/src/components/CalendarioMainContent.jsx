import React from 'react';
import '../assets/styles/CalendarioMainContent.css';

const CalendarioMainContent = (isNavbarVisible) => {
  return <div className={`main-content ${isNavbarVisible ? '' : 'full-width'}`}>CalendarioMainContent</div>;
};

export default CalendarioMainContent;
