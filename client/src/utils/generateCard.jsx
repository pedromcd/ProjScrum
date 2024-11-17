import { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';

export const formatDate = (date) => {
  const [year, month, day] = date.split('-');
  const formattedDate = new Date(Number(year), Number(month) - 1, Number(day));

  const formattedDay = String(formattedDate.getDate()).padStart(2, '0');
  const formattedMonth = String(formattedDate.getMonth() + 1).padStart(2, '0');
  const formattedYear = formattedDate.getFullYear();

  return `${formattedDay}-${formattedMonth}-${formattedYear}`;
};

export const useProjectCreation = () => {
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [projectMembers, setProjectMembers] = useState([]);
  const [projectCards, setProjectCards] = useState(() => {
    const storedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    return storedProjects;
  });

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projectCards));
  }, [projectCards]);

  const handleCreateProject = () => {
    if (!projectName || !projectDesc || !deliveryDate || projectMembers.length === 0) {
      return;
    }

    const newProjectId = uuid();
    const newProject = {
      id: newProjectId,
      projectName,
      projectDesc,
      deliveryDate: formatDate(deliveryDate),
      projectMembers: projectMembers.join(','),
    };

    setProjectCards((prevCards) => [...prevCards, newProject]);

    setProjectName('');
    setProjectDesc('');
    setDeliveryDate('');
    setProjectMembers([]);
  };

  const isFormValid = projectName && projectDesc && deliveryDate && projectMembers.length > 0;

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
    projectCards,
    setProjectCards,
    isFormValid,
  };
};
