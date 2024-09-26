import React, { useState } from 'react';
import '../assets/styles/CalendarioMainContent.css';
import Fullcalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Modal from './Modal';

const CalendarioMainContent = ({ isNavbarVisible }) => {
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className={`calendar-main-content ${isNavbarVisible ? '' : 'full-width'}`}>
      <div className='calendar-wrapper'>
        <div className='calendar-container'>
          <Fullcalendar
            className='calendar'
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={'dayGridMonth'}
            headerToolbar={{
              start: 'today prev,next',
              center: 'title',
              end: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            width={'600px'}
            height={'600px'}
          />
        </div>
        <div className='event-container'>
          <button className='event-button' onClick={() => setOpenModal(true)}>
            <span className='plus-icon'>
              <FontAwesomeIcon icon={faPlus} />
            </span>
            Adicionar evento
          </button>
        </div>
      </div>
      <Modal isOpen={openModal}></Modal>
    </div>
  );
};

export default CalendarioMainContent;
