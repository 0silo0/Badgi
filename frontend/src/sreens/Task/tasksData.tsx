import { Task } from './Task';

export const initialTasks: Task[] = [
  {
    id: '1',
    number: '#123',
    title: 'Разработка главной страницы',
    color: '#6366f1',
    start: new Date(),
    end: new Date(Date.now() + 3600000),
    assignee: { name: 'Иван Иванов' },
    type: 'Задача',
    priority: 'Высокий',
    status: 'todo',
    project: 'Веб-сайт',
    stage: 'Разработка',
    description: 'Необходимо разработать главную страницу с адаптивным дизайном'
  },
  {
    id: '2',
    number: '#124',
    title: 'Тестирование API',
    color: '#10b981',
    start: new Date(Date.now() + 86400000),
    end: new Date(Date.now() + 90000000),
    assignee: { name: 'Петр Петров' },
    type: 'Задача',
    priority: 'Средний',
    status: 'in_progress',
    project: 'Мобильное приложение',
    stage: 'Тестирование',
    description: 'Провести тестирование REST API endpoints'
  },
  {
    id: '3',
    number: '#125',
    title: 'Планирование спринта',
    color: '#f59e0b',
    start: new Date(Date.now() + 172800000),
    end: new Date(Date.now() + 173160000),
    assignee: { name: 'Мария Сидорова' },
    type: 'Совещание',
    priority: 'Низкий',
    status: 'todo',
    project: 'Веб-сайт',
    stage: 'Планирование',
    description: 'Планирование задач на следующий спринт',
    attendees: ['Иван Иванов', 'Петр Петров', 'Алексей Алексеев']
  }
];