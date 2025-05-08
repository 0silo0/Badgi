import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import './EventDetails.scss';

interface EventDetailsProps {
  event: {
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
  };
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const EventDetails: React.FC<EventDetailsProps> = ({ 
  event, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete 
}) => {
  if (!isOpen) return null;

  const formatTime = (date: Date) => format(date, 'HH:mm, d MMMM yyyy', { locale: ru });

  return (
    <div className="event-details-modal">
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content">
        <h3>{event.title}</h3>

        <div className="event-info">
          <div className="info-row">
            <span className="label">Тип:</span>
            <span className="value" style={{ color: event.color }}>
              {event.type}
            </span>
          </div>
          <div className="info-row">
            <span className="label">Начало:</span>
            <span className="value">{formatTime(event.start)}</span>
          </div>
          <div className="info-row">
            <span className="label">Окончание:</span>
            <span className="value">{formatTime(event.end)}</span>
          </div>
          {event.description && (
            <div className="info-row">
              <span className="label">Описание:</span>
              <span className="value">{event.description}</span>
            </div>
          )}
          {event.priority && (
            <div className="info-row">
              <span className="label">Приоритет:</span>
              <span className="value">{event.priority}</span>
            </div>
          )}
          {event.attendees && (
            <div className="info-row">
              <span className="label">Участники:</span>
              <span className="value">{event.attendees.join(', ')}</span>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="danger-btn" onClick={onDelete}>
            Удалить
          </button>
          <div>
            <button className="cancel-btn" onClick={onClose}>
              Закрыть
            </button>
            <button className="submit-btn" onClick={onEdit}>
              Редактировать
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;