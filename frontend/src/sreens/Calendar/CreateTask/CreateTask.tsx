import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import './CreateTask.scss';
import { MdTask, MdEvent, MdPeople, MdNotifications } from 'react-icons/md';

export type EventType = 'task' | 'event' | 'meeting' | 'reminder';

interface CreateTaskProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: {
    title: string;
    start: Date;
    end: Date;
    type: EventType;
    color: string;
    description?: string;
    priority?: string;
    dueDate?: Date;
    attendees?: string[];
  }) => void;
  initialStart?: Date;
  initialEnd?: Date;
}

const CreateTask: React.FC<CreateTaskProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialStart = new Date(),
  initialEnd = new Date(),
}) => {
  const [selectedType, setSelectedType] = useState<EventType>('event');
  const [title, setTitle] = useState('');
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [attendees, setAttendees] = useState('');
  const [selectedColor, setSelectedColor] = useState('#6366f1');
  const eventTypes = [
    { type: 'task', label: 'Задача', icon: <MdTask /> },
    { type: 'event', label: 'Событие', icon: <MdEvent /> },
    { type: 'meeting', label: 'Совещание', icon: <MdPeople /> },
    { type: 'reminder', label: 'Напоминание', icon: <MdNotifications /> },
  ];
  

  const colors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const handleSubmit = () => {
    const baseEvent = {
      title,
      start,
      end,
      type: selectedType,
      color: selectedColor,
      description: description || undefined,
    };

    const additionalFields = {
      ...(selectedType === 'task' && { priority, dueDate }),
      ...(selectedType === 'meeting' && { attendees: attendees.split(',').map(e => e.trim()) }),
    };

    onSubmit({ ...baseEvent, ...additionalFields });
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setStart(initialStart);
    setEnd(initialEnd);
    setDescription('');
    setPriority('medium');
    setDueDate(undefined);
    setAttendees('');
    setSelectedColor('#6366f1');
    setSelectedType('event');
  };

  if (!isOpen) return null;

  return (
    <div className="create-task-modal">
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content">
        <h3>Создание нового элемента</h3>
        
        <div className="type-selector">
          {eventTypes.map(({ type, label, icon }) => (
            <button
              key={type}
              className={selectedType === type ? 'active' : ''}
              onClick={() => setSelectedType(type as EventType)}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        <div className="color-picker">
          {colors.map(color => (
            <div
              key={color}
              className={`color-option ${selectedColor === color ? 'selected' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
            />
          ))}
        </div>

        <input
          type="text"
          placeholder="Название"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="time-pickers">
          <input
            type="datetime-local"
            value={format(start, "yyyy-MM-dd'T'HH:mm")}
            onChange={(e) => setStart(parseISO(e.target.value))}
          />
          <input
            type="datetime-local"
            value={format(end, "yyyy-MM-dd'T'HH:mm")}
            onChange={(e) => setEnd(parseISO(e.target.value))}
          />
        </div>

        {selectedType === 'task' && (
          <div className="additional-fields">
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Низкий приоритет</option>
              <option value="medium">Средний приоритет</option>
              <option value="high">Высокий приоритет</option>
            </select>
            <input
              type="date"
              value={dueDate ? format(dueDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => setDueDate(parseISO(e.target.value))}
            />
          </div>
        )}

        {selectedType === 'meeting' && (
          <div className="additional-fields">
            <input
              type="text"
              placeholder="Участники (через запятую)"
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
            />
          </div>
        )}

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Отмена
          </button>
          <button className="submit-btn" onClick={handleSubmit}>
            Создать
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;