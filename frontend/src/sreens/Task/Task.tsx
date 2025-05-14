import React, { useState } from 'react';
import OpenTask from './OpenTask';
import { MdMoreVert, MdEdit } from 'react-icons/md';
import './Task.scss';
import { initialTasks } from './tasksData';

export interface Task {
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

const Task: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [showMenuId, setShowMenuId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isCreatingNewTask, setIsCreatingNewTask] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const handleStatusChange = (taskId: string, newStatus: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
  };

  const handleCreateTask = () => {
    const newTask = {
      id: Math.random().toString(),
      number: `#${Math.floor(Math.random() * 1000)}`,
      title: '',
      start: new Date(),
      end: new Date(Date.now() + 3600000),
      color: '#6366f1',
      type: 'Задача',
      status: 'todo',
      project: '',
      stage: '',
      assignee: { name: '' },
      description: ''
    };
    setTasks([...tasks, newTask]);
    setSelectedTaskId(newTask.id);
    setIsCreatingNewTask(true);
    setIsEditing(true);
  };

  const handleSaveTask = (updatedTask: Task) => {
    if (isCreatingNewTask) {
      setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    } else {
      setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    }
    setSelectedTaskId(null);
    setIsCreatingNewTask(false);
    setIsEditing(false);
  };

  const handleUseAsTemplate = (task: Task) => {
    const newTask = {
      ...task,
      id: Math.random().toString(),
      number: `#${Math.floor(Math.random() * 1000)}`,
      title: '',
      description: '',
      status: 'todo'
    };
    setTasks([...tasks, newTask]);
    setSelectedTaskId(newTask.id);
    setIsCreatingNewTask(true);
    setIsEditing(true);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus ? task.status === selectedStatus : true;
    const matchesProject = selectedProject ? task.project === selectedProject : true;
    const matchesStage = selectedStage ? task.stage === selectedStage : true;
    return matchesSearch && matchesStatus && matchesProject && matchesStage;
  });

  const selectedTask = selectedTaskId ? tasks.find(task => task.id === selectedTaskId) : null;

  return (
    <div className="task-page">
      {!selectedTaskId ? (
        <div className="task-list-container">
          <div className="task-controls">
            <div className="search-filter">
              <input
                type="text"
                placeholder="Поиск задач..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="filter-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">Все статусы</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <select
                className="filter-select"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                <option value="">Все проекты</option>
                <option value="Веб-сайт">Веб-сайт</option>
                <option value="Мобильное приложение">Мобильное приложение</option>
              </select>
              <select
                className="filter-select"
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
              >
                <option value="">Все этапы</option>
                <option value="Планирование">Планирование</option>
                <option value="Разработка">Разработка</option>
                <option value="Тестирование">Тестирование</option>
              </select>
            </div>
            <button className="create-task-btn" onClick={handleCreateTask}>
              + Создать задачу
            </button>
          </div>
          <table className="task-table">
            <thead className="table-header">
              <tr>
                <th>№</th>
                <th>Название</th>
                <th>Исполнитель</th>
                <th>Тип</th>
                <th>Приоритет</th>
                <th>Статус</th>
                <th>Проект</th>
                <th>Этап</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(task => (
                <tr 
                  key={task.id} 
                  className="task-row"
                  onClick={() => {
                    setSelectedTaskId(task.id);
                    setIsEditing(false);
                  }}
                >
                  <td>{task.number}</td>
                  <td>
                    <div className="task-color" style={{ backgroundColor: task.color }} />
                    {task.title}
                  </td>
                  <td>
                    <div className="assignee-info">
                      <div className="avatar">
                        {task.assignee.name.slice(0, 1)}
                      </div>
                      {task.assignee.name}
                    </div>
                  </td>
                  <td>{task.type}</td>
                  <td>{task.priority}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <select
                      className="status-select"
                      value={task.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleStatusChange(task.id, e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </td>
                  <td>{task.project}</td>
                  <td>{task.stage}</td>
                  <td>
                    <div className="context-menu">
                      <div 
                        className="menu-dots" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenuId(task.id === showMenuId ? null : task.id);
                        }}
                      >
                        <MdMoreVert size={20} />
                      </div>
                      {showMenuId === task.id && (
                        <div className="menu-content">
                          <button onClick={() => {
                            setSelectedTaskId(task.id);
                            setIsEditing(true);
                          }}>
                            Изменить
                          </button>
                          <button onClick={() => handleDeleteTask(task.id)}>Удалить</button>
                          <button onClick={() => handleUseAsTemplate(task)}>
                            Использовать как шаблон
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <OpenTask
          task={selectedTask!}
          isCreating={isCreatingNewTask}
          isEditing={isEditing}
          onClose={() => {
            if (isCreatingNewTask) {
              setTasks(tasks.filter(t => t.id !== selectedTaskId));
            }
            setSelectedTaskId(null);
            setIsCreatingNewTask(false);
            setIsEditing(false);
          }}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          onEdit={() => setIsEditing(true)}
        />
      )}
    </div>
  );
};

export default Task;