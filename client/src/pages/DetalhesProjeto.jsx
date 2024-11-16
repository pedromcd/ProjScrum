import React, { useEffect, useState } from 'react';
import Navbar from '../components/NavBar';
import Header from '../components/Header';
import ProjectDetails from '../components/ProjectDetails';
import { useParams } from 'react-router-dom';
import { projectService } from '../services/api';

const DetalhesProjeto = ({ theme, setTheme, isNavbarVisible, toggleNavbar, setIsAuthenticated }) => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setIsLoading(true);
        const startTime = Date.now();

        // Fetch project details by ID
        const projectData = await projectService.getProjectById(projectId);

        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < 300) {
          await new Promise((resolve) => setTimeout(resolve, 500 - elapsedTime));
        }

        const formattedProjectData = {
          ...projectData,
          projectMembers: projectData.projectMembers
            ? typeof projectData.projectMembers === 'string'
              ? projectData.projectMembers.split(',').filter((member) => member.trim() !== '')
              : projectData.projectMembers
            : [],
        };

        setProject(formattedProjectData);
        setIsLoading(false);
      } catch (error) {
        console.error('Detailed error fetching project data:', {
          error,
          projectId,
        });

        setError({
          message: error.error || 'Erro ao carregar projeto',
          details: error.details || 'Detalhes não disponíveis',
        });
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className={`container ${theme}`}>
        <div className='loading-screen'>
          <div className='spinner' />
          <div>Carregando...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return <div>Erro ao carregar projeto: {error.message}</div>;
  }

  // No project found
  if (!project) {
    return <div>Projeto não encontrado</div>;
  }

  return (
    <div className={`container ${theme}`}>
      <Header toggleNavbar={toggleNavbar} isNavbarVisible={isNavbarVisible} />
      <Navbar
        theme={theme}
        setTheme={setTheme}
        isVisible={isNavbarVisible}
        setIsAuthenticated={setIsAuthenticated}
      />
      <ProjectDetails isNavbarVisible={isNavbarVisible} project={project} />
    </div>
  );
};

export default DetalhesProjeto;
