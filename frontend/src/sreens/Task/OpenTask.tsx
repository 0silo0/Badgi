import React, { useState } from 'react';
import { 
  MdClose, 
  MdFormatBold, 
  MdFormatItalic, 
  MdFormatListNumbered, 
  MdFormatListBulleted,
  MdEdit
} from 'react-icons/md';
import './OpenTask.scss';
import TaskComments from './TaskComments';

interface Task {
  id: string;
  number: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  type: string;
  description?: string;
  priority?: string;
  status: string;
  project: string;
  stage: string;
  assignee: {
    name: string;
    avatar?: string;
  };
  attendees?: string[];
  dueDate?: Date;
}

interface OpenTaskProps {
  task: Task;
  isCreating: boolean;
  isEditing: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onEdit: () => void;
}

const OpenTask: React.FC<OpenTaskProps> = ({ 
  task, 
  isCreating, 
  isEditing, 
  onClose, 
  onSave, 
  onDelete,
  onEdit
}) => {
  const [editedTask, setEditedTask] = useState<Task>(task);
  const [selectedColor, setSelectedColor] = useState(task.color);
  
  const colors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const statusOptions = ['todo', 'in_progress', 'done'];
  const priorityOptions = ['low', 'medium', 'high'];
  const typeOptions = ['Задача', 'Событие', 'Совещание', 'Напоминание'];
  const projectOptions = ['Веб-сайт', 'Мобильное приложение'];
  const stageOptions = ['Планирование', 'Разработка', 'Тестирование'];

  const handleChange = (
    field: keyof Task, 
    value: string | Date | string[] | { name: string; avatar?: string }
  ) => {
    setEditedTask(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSave({ ...editedTask, color: selectedColor });
  };

  const handleDelete = () => {
    if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
      onDelete(editedTask.id);
      onClose();
    }
  };

  const applyFormat = (format: string) => {
    let newDescription = editedTask.description || '';
    
    if (format === 'bold') {
      newDescription += ' **bold text** ';
    } else if (format === 'italic') {
      newDescription += ' *italic text* ';
    } else if (format === 'numbered') {
      newDescription += '\n1. First item\n2. Second item\n3. Third item';
    } else if (format === 'bulleted') {
      newDescription += '\n- Item 1\n- Item 2\n- Item 3';
    }
    
    handleChange('description', newDescription);
  };

  const renderDescription = () => {
    if (!editedTask.description) return null;
    
    // Простое форматирование Markdown
    return editedTask.description
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n- (.*?)(\n|$)/g, '\n<li>$1</li>')
      .replace(/\n\d+\. (.*?)(\n|$)/g, '\n<li>$1</li>')
      .replace(/\n<li>/g, '<ul><li>')
      .replace(/<\/li>\n/g, '</li></ul>');
  };

  return (
    <div className="task-container">
      <div className="task-main">
        <div className="task-header">
          <div className="title-section">
            <div className="task-meta">
              <span className="task-id">{editedTask.number}</span>
              {isEditing ? (
                <input
                  type="text"
                  className="title-input"
                  value={editedTask.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Название задачи"
                />
              ) : (
                <h2 className="task-title">{editedTask.title}</h2>
              )}
              <button className="edit-btn" onClick={onEdit}>
                <MdEdit size={20} />
              </button>
            </div>
            <div className="project-name">{editedTask.project || 'Без проекта'}</div>
          </div>
        </div>

        <div className="description-container">
          {isEditing ? (
            <>
              <div className="markdown-toolbar">
                <button onClick={() => applyFormat('bold')} title="Жирный">
                  <MdFormatBold size={18} />
                </button>
                <button onClick={() => applyFormat('italic')} title="Курсив">
                  <MdFormatItalic size={18} />
                </button>
                <button onClick={() => applyFormat('numbered')} title="Нумерованный список">
                  <MdFormatListNumbered size={18} />
                </button>
                <button onClick={() => applyFormat('bulleted')} title="Маркированный список">
                  <MdFormatListBulleted size={18} />
                </button>
              </div>
              <textarea
                className="description-editor"
                value={editedTask.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Добавьте подробное описание задачи..."
              />
            </>
          ) : (
            <div 
              className="description-view"
              dangerouslySetInnerHTML={{ __html: renderDescription() || 'Нет описания' }}
            />
          )}
        </div>

        <TaskComments />

        <div className="task-actions">
          {!isCreating && (
            <button className="delete-btn" onClick={handleDelete}>
              Удалить
            </button>
          )}
          <button className="cancel-btn" onClick={onClose}>
            Отмена
          </button>
          {isEditing && (
            <button className="save-btn" onClick={handleSubmit}>
              {isCreating ? 'Создать' : 'Сохранить'}
            </button>
          )}
        </div>
      </div>

      <div className="task-sidebar">
        <div className="form-group">
          <label>Тип</label>
          <select
            value={editedTask.type}
            onChange={(e) => handleChange('type', e.target.value)}
            disabled={!isEditing}
          >
            {typeOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Цвет</label>
          <div className="color-picker">
            {colors.map(color => (
              <div
                key={color}
                className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => isEditing && setSelectedColor(color)}
              />
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Статус</label>
          <select
            value={editedTask.status}
            onChange={(e) => handleChange('status', e.target.value)}
            disabled={!isEditing}
          >
            {statusOptions.map(option => (
              <option key={option} value={option}>
                {option === 'todo' ? 'To Do' : 
                 option === 'in_progress' ? 'In Progress' : 'Done'}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Приоритет</label>
          <select
            value={editedTask.priority || 'medium'}
            onChange={(e) => handleChange('priority', e.target.value)}
            disabled={!isEditing}
          >
            {priorityOptions.map(option => (
              <option key={option} value={option}>
                {option === 'low' ? 'Низкий' : 
                 option === 'medium' ? 'Средний' : 'Высокий'}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Проект</label>
          <select
            value={editedTask.project}
            onChange={(e) => handleChange('project', e.target.value)}
            disabled={!isEditing}
          >
            <option value="">Выберите проект</option>
            {projectOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Этап</label>
          <select
            value={editedTask.stage}
            onChange={(e) => handleChange('stage', e.target.value)}
            disabled={!isEditing}
          >
            <option value="">Выберите этап</option>
            {stageOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Исполнитель</label>
          <input
            value={editedTask.assignee.name}
            onChange={(e) => handleChange('assignee', { ...editedTask.assignee, name: e.target.value })}
            disabled={!isEditing}
          />
        </div>

        {editedTask.type === 'Совещание' && (
          <div className="form-group">
            <label>Участники</label>
            <input
              type="text"
              value={editedTask.attendees?.join(', ') || ''}
              onChange={(e) => handleChange('attendees', e.target.value.split(',').map(s => s.trim()))}
              disabled={!isEditing}
              placeholder="Введите имена через запятую"
            />
          </div>
        )}

        <div className="form-group">
          <label>Дата начала</label>
          <input
            type="datetime-local"
            value={editedTask.start.toISOString().slice(0, 16)}
            onChange={(e) => handleChange('start', new Date(e.target.value))}
            disabled={!isEditing}
            className="date-input"
          />
        </div>

        <div className="form-group">
          <label>Дата окончания</label>
          <input
            type="datetime-local"
            value={editedTask.end.toISOString().slice(0, 16)}
            onChange={(e) => handleChange('end', new Date(e.target.value))}
            disabled={!isEditing}
            className="date-input"
          />
        </div>
      </div>
    </div>
  );
};

export default OpenTask;