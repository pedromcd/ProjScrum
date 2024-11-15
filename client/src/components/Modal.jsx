import React from 'react';
import '../assets/styles/Modal.css';

const Modal = ({ isOpen, children, theme }) => {
  if (!isOpen) return null;

  return (
    <div className={`modal-background ${theme === 'dark' ? 'dark-mode' : ''}`}>
      <div className={`modal-container ${theme === 'dark' ? 'dark-mode' : ''}`}>{children}</div>
    </div>
  );
};

export default Modal;
