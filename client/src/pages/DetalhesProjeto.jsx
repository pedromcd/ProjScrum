import React, { useEffect, useState } from 'react';
import Navbar from '../components/NavBar';
import Header from '../components/Header';
import ProjectDetails from '../components/ProjectDetails';
import { useParams } from 'react-router-dom';

const getStoredProjects = () => {
  return JSON.parse(localStorage.getItem('projects')) || [];
};

const DetalhesProjeto = ({ theme, setTheme, isNavbarVisible, toggleNavbar }) => {
  const { projectName } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    const storedProjects = getStoredProjects();
    const selectedProject = storedProjects.find((proj) => proj.projectName === projectName);

    if (selectedProject) {
      setProject(selectedProject);
    }
  }, [projectName]);

  if (!project) {
    return <div>No project found</div>;
  }

  return (
    <div className={`container ${theme}`}>
      <Header toggleNavbar={toggleNavbar} />
      <Navbar theme={theme} setTheme={setTheme} isVisible={isNavbarVisible} />
      <ProjectDetails isNavbarVisible={isNavbarVisible} project={project} />
    </div>
  );
};

export default DetalhesProjeto;
