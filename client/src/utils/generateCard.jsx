import { useState } from 'react';
import { Link } from 'react-router-dom';

export const formatDate = (date) => {
  const [year, month, day] = date.split('-');
  const formattedDate = new Date(Number(year), Number(month) - 1, Number(day));
  return formattedDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const useProjectCreation = () => {
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [projectMembers, setProjectMembers] = useState('');
  const [projectCards, setProjectCards] = useState(JSON.parse(localStorage.getItem('projects') || '[]'));

  const [year, month, day] = deliveryDate.split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const formattedDate = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const handleCreateProject = () => {
    if (!projectName || !projectDesc || !deliveryDate || !projectMembers) {
      return;
    }

    const newProjectId = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const newProject = {
      id: newProjectId,
      projectName,
      projectDesc,
      deliveryDate: formattedDate,
      projectMembers: projectMembers.join(','),
    };

    setProjectCards([...projectCards, newProject]);

    const storedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    storedProjects.push(newProject);
    localStorage.setItem('projects', JSON.stringify(storedProjects));

    setProjectName('');
    setProjectDesc('');
    setDeliveryDate('');
    setProjectMembers('');
  };

  const isFormValid = projectName && projectDesc && deliveryDate && projectMembers;

  return {
    projectName,
    setProjectName,
    projectDesc,
    setProjectDesc,
    deliveryDate,
    setDeliveryDate,
    projectMembers,
    setProjectMembers,
    handleCreateProject,
    projectCards: projectCards.map((project) => (
      <Link className='link' to={`/${project.projectName}`} key={project.projectName}>
        <div className='project-cards' key={project.projectName}>
          <h1>{project.projectName}</h1>
          <h2>{project.projectDesc}</h2>
          <h3>Data de entrega: {project.deliveryDate}</h3>
        </div>
      </Link>
    )),
    isFormValid,
  };
};
