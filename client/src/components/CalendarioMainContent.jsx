import React, { useRef, useState, useEffect } from 'react';
import '../assets/styles/CalendarioMainContent.css';
import Fullcalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Modal from './Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark, faTrashCan } from '@fortawesome/free-solid-svg-icons';

const CalendarioMainContent = ({ isNavbarVisible }) => {
  const [openModal, setOpenModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const calendarRef = useRef(null);
  const trashRef = useRef(null); // Referência para o ícone da lixeira

  const handleAddEvent = () => {
    let start = date;
    if (startTime) {
      start += `T${startTime}`;
    }

    const event = {
      id: Math.random().toString(36).substr(2, 9),
      title: title,
      start: start,
      end: endDate,
      allDay: startTime ? false : true,
      extendedProps: {
        description: description,
      },
    };

    const events = JSON.parse(localStorage.getItem('events')) || [];
    events.push(event);
    localStorage.setItem('events', JSON.stringify(events));

    calendarRef.current.getApi().addEvent(event);
    setOpenModal(false);
  };

  const handleDeleteEvent = (event) => {
    const events = JSON.parse(localStorage.getItem('events')) || [];
    const updatedEvents = events.filter((e) => e.id !== event.id);
    localStorage.setItem('events', JSON.stringify(updatedEvents));

    event.remove(); // Remove o evento do calendário imediatamente
  };

  useEffect(() => {
    const events = JSON.parse(localStorage.getItem('events')) || [];
    events.forEach((event) => {
      calendarRef.current.getApi().addEvent(event);
    });
  }, []);

  const isOverTrash = (event) => {
    const trashRect = trashRef.current.getBoundingClientRect();
    const eventX = event.jsEvent.clientX;
    const eventY = event.jsEvent.clientY;

    return (
      eventX >= trashRect.left &&
      eventX <= trashRect.right &&
      eventY >= trashRect.top &&
      eventY <= trashRect.bottom
    );
  };

  return (
    <div className={`calendar-main-content ${isNavbarVisible ? '' : 'full-width'}`}>
      <div className='calendar-wrapper'>
        <div className='calendar-container'>
          <Fullcalendar
            eventDisplay='auto'
            dayMaxEvents={3}
            moreLinkClick={(arg) => {
              console.log(arg);
            }}
            moreLinkClassNames='more-link'
            inclusiveEnd={true}
            displayEventEnd={true}
            editable={true}
            eventDurationEditable={true}
            eventStartEditable={true}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }}
            eventMouseEnter={(arg) => {
              console.log(arg);
            }}
            eventMouseLeave={(arg) => {
              console.log(arg);
            }}
            eventDragStart={() => {
              // Reseta o estado se necessário
            }}
            eventDragStop={(arg) => {
              if (isOverTrash(arg)) {
                handleDeleteEvent(arg.event); // Exclui o evento imediatamente
              }
            }}
            eventDrop={(arg) => {
              const events = JSON.parse(localStorage.getItem('events')) || [];
              const index = events.findIndex((event) => event.id === arg.event.id);
              if (index !== -1) {
                events[index].start = arg.event.start;
                events[index].end = arg.event.end;
                localStorage.setItem('events', JSON.stringify(events));
              }
            }}
            eventResize={(arg) => {
              const events = JSON.parse(localStorage.getItem('events')) || [];
              const index = events.findIndex((event) => event.id === arg.event.id);
              if (index !== -1) {
                events[index].start = arg.event.start;
                events[index].end = arg.event.end;
                localStorage.setItem('events', JSON.stringify(events));
              }
            }}
            ref={(calendar) => (calendarRef.current = calendar)}
            className='calendar'
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={'dayGridMonth'}
            headerToolbar={{
              start: 'today prev,next',
              center: 'title',
              end: 'dayGridMonth,timeGridWeek,timeGridDay, addEventButton',
            }}
            width={'600px'}
            height={'600px'}
            customButtons={{
              addEventButton: {
                text: 'Adicionar evento',
                click: () => setOpenModal(true),
              },
            }}
          />
        </div>
        <span className='trash-icon-event' ref={trashRef}>
          <FontAwesomeIcon icon={faTrashCan} />
        </span>
      </div>
      <Modal isOpen={openModal}>
        <div className='modal-close-button' onClick={() => setOpenModal(false)}>
          <FontAwesomeIcon icon={faCircleXmark} />
        </div>
        <div className='modal-event-inputs'>
          <ul className='event-inputs'>
            <li>
              <p>Título:</p>
              <input type='text' value={title} onChange={(e) => setTitle(e.target.value)} />
            </li>
            <li>
              <p>Descrição:</p>
              <input type='text' value={description} onChange={(e) => setDescription(e.target.value)} />
            </li>
            <li>
              <p>Data de início:</p>
              <input type='date' value={date} onChange={(e) => setDate(e.target.value)} />
            </li>
            <li>
              <p>Data de término:</p>
              <input type='date' value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </li>
            <li>
              <p>Hora de início:</p>
              <input type='time' value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </li>
          </ul>
          <button className='create-event' onClick={handleAddEvent}>
            Adicionar evento
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default CalendarioMainContent;
