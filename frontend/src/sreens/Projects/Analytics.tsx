// ProjectPage.tsx (без изменений, оставляем как есть)
// Твой существующий код остается без изменений

// Создаем новый компонент Analytics.tsx
import { useOutletContext } from 'react-router-dom';
import { Project } from '../../types/project';
import './styles/analytics.scss'; // Создадим новый файл стилей
import { useEffect, useState } from 'react';
import { Task as TaskType } from '../../types/task';
import { TasksApi } from '../../api/tasks.api';

export const Analytics = () => {
  const project = useOutletContext<Project>();
  const [tasks, setTasks] = useState<TaskType[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tasksData] = await Promise.all([
          TasksApi.getProjectTasks(project.primarykey),
        ]);
        setTasks(tasksData);
      } catch (error) {
        console.error('Ошибка загрузки:', error);
      }
    };
    loadData();
  }, []);

    const statusCounts = {
    todo: 0,
    in_progress: 0,
    done: 0
    };

    tasks.forEach(task => {
        if (task.status === 'todo') {
            statusCounts.todo++;
        } else if (task.status === 'in_progress') {
            statusCounts.in_progress++;
        } else if (task.status === 'done') {
            statusCounts.done++;
        }
    });

  return (
    <div className="analytics-container">      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Участники</h3>
          <div className="stat-value">
            {project.ProjectMember.length}
          </div>
        </div>
        
        <div className="stat-card">
          <h3>Команды</h3>
          <div className="stat-value">
            {project.teams.length}
          </div>
        </div>
        
        <div className="stat-card">
          <h3>Длительность</h3>
          <div className="stat-value">
            {Math.ceil(
              (new Date(project.endDate).getTime() - 
               new Date(project.startDate).getTime()) / 
              (1000 * 3600 * 24)
            )} дней
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart">
          <h4>Распределение ролей</h4>
          {/* Здесь можно добавить график */}
        </div>
        
        <div className="chart">
          <h4>Прогресс проекта</h4>
            <div className="stats-grid">
            <div className="stat-card">
                <h3>Статусы задач</h3>
                <div className="status-stats">
                <div className="status-item">
                    <span className="status-label">В планах сделать:</span>
                    <span className="status-value">{statusCounts.todo}</span>
                </div>
                <div className="status-item">
                    <span className="status-label">В процессе:</span>
                    <span className="status-value">{statusCounts.in_progress}</span>
                </div>
                <div className="status-item">
                    <span className="status-label">Сделано:</span>
                    <span className="status-value">{statusCounts.done}</span>
                </div>
                </div>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};