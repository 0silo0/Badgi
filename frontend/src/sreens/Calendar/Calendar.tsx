import React, { useState } from 'react';
import { format, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import './Calendar.scss';
import MonthView from './MonthView/MonthView';
import WeekView from './WeekView/WeekView';
import DayView from './DayView/DayView';
import CreateTask from './CreateTask/CreateTask';
import EventDetails from './EventDetails/EventDetails';
import Event from './Event/Event';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: string;
  color: string;
  description?: string;
  priority?: string;
  dueDate?: Date;
  attendees?: string[];
}

const Calendar = () => {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Обработчик клика по событию
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  // Удаление события
  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents(events.filter(e => e.id !== selectedEvent.id));
      setShowDetailsModal(false);
    }
  };

  // Редактирование события
  const handleEditEvent = () => {
    setShowModal(true);
    setShowDetailsModal(false);
  };

  // Добавление нового события
  const handleAddEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent = { ...event, id: Math.random().toString() };
    setEvents([...events, newEvent]);
    setShowModal(false);
  };

  return (
    <div className="calendar-container">
      <div className="calendar-toolbar">
        <div className="view-controls">
          <button 
            className={viewMode === 'month' ? 'active' : ''}
            onClick={() => setViewMode('month')}
          >
            Месяц
          </button>
          <button 
            className={viewMode === 'week' ? 'active' : ''}
            onClick={() => setViewMode('week')}
          >
            Неделя
          </button>
          <button 
            className={viewMode === 'day' ? 'active' : ''}
            onClick={() => setViewMode('day')}
          >
            День
          </button>
        </div>
        
        <div className="date-navigation">
          <button onClick={() => setCurrentDate(addDays(currentDate, -7))}>←</button>
          <h2>{format(currentDate, 'MMMM yyyy', { locale: ru })}</h2>
          <button onClick={() => setCurrentDate(addDays(currentDate, 7))}>→</button>
        </div>

        <button 
          className="add-event-btn"
          onClick={() => setShowModal(true)}
        >
          + Создать событие
        </button>
      </div>

      <div className={`calendar-body ${viewMode}-view`}>
        {viewMode === 'month' ? (
          <MonthView 
            currentDate={currentDate} 
            events={events} 
            onEventClick={handleEventClick}
          />
        ) : viewMode === 'week' ? (
          <WeekView 
            currentDate={currentDate} 
            events={events} 
            onEventClick={handleEventClick}
          />
        ) : (
          <DayView 
            currentDate={currentDate} 
            events={events} 
            onEventClick={handleEventClick}
          />
        )}
      </div>

      <CreateTask
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleAddEvent}
      />

      <EventDetails
        event={selectedEvent!}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
      />

    </div>
  );
};

export default Calendar;