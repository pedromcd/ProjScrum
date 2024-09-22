import { useState } from 'react';

export const useProjectCreation = () => {
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [projectMembers, setProjectMembers] = useState('');
  const [projectCards, setProjectCards] = useState([]);

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

    const newProjectCard = (
      <div className='project-cards' key={Date.now()}>
        <h1>{projectName}</h1>
        <h2>{projectDesc}</h2>
        <h3>Data de entrega: {formattedDate}</h3>
      </div>
    );

    setProjectCards((prevProjectCards) => [...prevProjectCards, newProjectCard]);

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
    projectCards,
    isFormValid,
  };
};
