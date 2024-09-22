import { useState } from 'react';

// Custom hook to manage project creation logic
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
    // Generate a new project card
    const newProjectCard = (
      <div className='project-cards' key={Date.now()}>
        <h1>{projectName}</h1>
        <h2>{projectDesc}</h2>
        <h3>Data de entrega: {formattedDate}</h3>
      </div>
    );

    // Add the new project card to the list of project cards
    setProjectCards((prevProjectCards) => [...prevProjectCards, newProjectCard]);

    // Clear the input fields
    setProjectName('');
    setProjectDesc('');
    setDeliveryDate('');
    setProjectMembers('');
  };

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
  };
};
