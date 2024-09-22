import React from 'react';
import '../assets/styles/Modal.css';

export default function Modal({ isOpen, children }) {
  if (isOpen) {
    return (
      <div className='modal-background'>
        <div className='modal-container'>{children}</div>
      </div>
    );
  }

  return null;
}
