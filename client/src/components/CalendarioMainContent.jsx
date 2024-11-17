import React, { useRef, useState, useEffect } from 'react';
import '../assets/styles/CalendarioMainContent.css';
import Fullcalendar from '@fullcalendar/react';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Modal from './Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { Alert, Snackbar } from '@mui/material';
import { calendarService } from '../services/api';

const CalendarioMainContent = ({ isNavbarVisible }) => {
  const [openModal, setOpenModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [events, setEvents] = useState([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const calendarRef = useRef(null);
  const trashRef = useRef(null);

  // Fetch events when component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const fetchedEvents = await calendarService.getEvents();

        if (fetchedEvents.length === 0) {
          setAlertMessage('Nenhum evento encontrado');
          setAlertSeverity('info');
          setAlertOpen(true);
        } else {
          setEvents(fetchedEvents);

          // Wait for the calendar ref to be available
          const addEventsToCalendar = () => {
            if (calendarRef.current) {
              const calendarApi = calendarRef.current.getApi();
              fetchedEvents.forEach((event) => {
                calendarApi.addEvent(event);
              });
            } else {
              // If ref is not available, retry after a short delay
              setTimeout(addEventsToCalendar, 100);
            }
          };

          addEventsToCalendar();
        }
      } catch (error) {
        console.error('Full event fetch error:', error);
        setAlertMessage(`Erro ao carregar eventos: ${error.message}`);
        setAlertSeverity('error');
        setAlertOpen(true);
      }
    };

    fetchEvents();
  }, []);

  const handleAddEvent = async () => {
    let start = date;
    if (startTime) {
      start += `T${startTime}`;
    }

    const eventData = {
      title,
      description,
      start,
      end: endDate,
    };

    try {
      const newEvent = await calendarService.createEvent(eventData);

      // Add event to calendar
      calendarRef.current.getApi().addEvent(newEvent);

      // Update local state
      setEvents([...events, newEvent]);

      // Reset form and close modal
      resetForm();
      setOpenModal(false);

      // Show success message
      setAlertMessage('Evento criado com sucesso');
      setAlertSeverity('success');
      setAlertOpen(true);
    } catch (error) {
      setAlertMessage('Erro ao criar evento');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  const handleDeleteEvent = async (event) => {
    try {
      // Ensure we're using the correct event ID
      const eventId = typeof event === 'object' ? event.id : event;

      await calendarService.deleteEvent(eventId);

      // Remove from calendar
      if (typeof event === 'object' && event.remove) {
        event.remove();
      }

      // Update local state
      const updatedEvents = events.filter((e) => e.id !== eventId);
      setEvents(updatedEvents);

      // Show success message
      setAlertMessage('Evento deletado com sucesso');
      setAlertSeverity('success');
      setAlertOpen(true);
    } catch (error) {
      console.error('Detailed delete error:', error);

      setAlertMessage('Erro ao deletar evento');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
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

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setStartTime('');
    setEndDate('');
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  return (
    <div className={`calendar-main-content ${isNavbarVisible ? '' : 'full-width'}`}>
      <div className='calendar-wrapper'>
        <div className='calendar-container'>
          <Fullcalendar
            locale='pt-br'
            locales={[ptBrLocale]}
            eventDisplay='auto'
            dayMaxEvents={3}
            moreLinkClick={(arg) => {
              console.log(arg);
            }}
            moreLinkClassNames='more-link'
            displayEventEnd={true}
            editable={true}
            eventDurationEditable={false}
            eventStartEditable={true}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
              omitZeroMinute: true,
            }}
            // Prevent events from being resized
            eventResize={(resizeInfo) => {
              resizeInfo.revert();
              setAlertMessage('Redimensionamento de evento não permitido');
              setAlertSeverity('error');
              setAlertOpen(true);
            }}
            // Custom event drop handler
            eventDrop={async (dropInfo) => {
              try {
                // Prevent default behavior
                dropInfo.jsEvent.preventDefault();

                // Get the original and new event
                const originalEvent = dropInfo.oldEvent;
                const newEvent = dropInfo.event;

                // Format date to YYYY-MM-DD exactly as it appears
                const formatDateToYMD = (date) => {
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  return `${year}-${month}-${day}`;
                };

                // Call your backend service to update the event
                const updatedEventResponse = await calendarService.updateEventDate({
                  eventId: originalEvent.id,
                  newDate: formatDateToYMD(newEvent.start),
                });

                // Update local state
                setEvents((prevEvents) =>
                  prevEvents.map((event) =>
                    event.id === originalEvent.id
                      ? {
                          ...event,
                          start: updatedEventResponse.event.start,
                          end: updatedEventResponse.event.end,
                        }
                      : event
                  )
                );

                // Optional: Show success message
                setAlertMessage('Evento atualizado com sucesso');
                setAlertSeverity('success');
                setAlertOpen(true);
              } catch (error) {
                console.error('Erro ao mover evento:', error);

                // Revert the event to its original position
                if (calendarRef.current) {
                  const calendarApi = calendarRef.current.getApi();

                  // Remove the new (incorrect) event
                  const eventToRemove = calendarApi.getEventById(dropInfo.event.id);
                  if (eventToRemove) {
                    eventToRemove.remove();
                  }

                  // Add back the original event
                  calendarApi.addEvent(dropInfo.oldEvent.toPlainObject());
                }

                // Show error message
                setAlertMessage('Erro ao atualizar evento');
                setAlertSeverity('error');
                setAlertOpen(true);
              }
            }}
            // Handle trash icon deletion
            eventDragStop={(arg) => {
              if (isOverTrash(arg)) {
                handleDeleteEvent(arg.event);
              }
            }}
            events={events}
            ref={(calendar) => {
              calendarRef.current = calendar;
            }}
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

      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleAlertClose} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CalendarioMainContent;
