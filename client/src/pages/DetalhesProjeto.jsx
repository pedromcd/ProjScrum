import React, { useEffect, useState } from 'react';
import Navbar from '../components/NavBar';
import Header from '../components/Header';
import ProjectDetails from '../components/ProjectDetails';
import { useParams } from 'react-router-dom';

const DetalhesProjeto = ({ theme, setTheme, isNavbarVisible, toggleNavbar }) => {
  const { projectName } = useParams();
  const [project, setProject] = useState(null);
  const getStoredProjects = () => {
    return JSON.parse(localStorage.getItem('projects')) || [];
  };

  useEffect(() => {
    const storedProjects = getStoredProjects();
    const selectedProject = storedProjects.find((proj) => proj.projectName === projectName);

    if (selectedProject) {
      setProject(selectedProject);
    }
  }, [projectName]);

  return (
    <div className={`container ${theme}`}>
      <Header toggleNavbar={toggleNavbar} isNavbarVisible={isNavbarVisible} />
      <Navbar theme={theme} setTheme={setTheme} isVisible={isNavbarVisible} />
      {project && <ProjectDetails isNavbarVisible={isNavbarVisible} project={project} />}
    </div>
  );
};

export default DetalhesProjeto;
