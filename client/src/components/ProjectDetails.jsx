import React from 'react';
import '../assets/styles/ProjectDetails.css';

const ProjectDetails = ({ isNavbarVisible, project }) => {
  if (!project) {
    return <div>No project found</div>;
  }

  return (
    <div className={`project-details-container ${isNavbarVisible ? '' : 'full-width'}`}>
      <h1>Teste: {project.projectDesc}</h1>
    </div>
  );
};

export default ProjectDetails;
