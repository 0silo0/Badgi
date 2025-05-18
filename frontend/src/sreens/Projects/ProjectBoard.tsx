import { useOutletContext } from 'react-router-dom';
import { Project } from '../../types/project';
import { useState } from 'react';

const taskStatus = ['todo', 'progress', 'review', 'done'];

const initialTasks = [
    { id: 1, title: 'Task 1', status: 'todo', priority: 1 },
    { id: 2, title: 'Task 2', status: 'progress', priority: 2 },
];

function Column(props: any) {

  return (
    <div className="column">
      {props.tasks.map((task: any) => (
        <div className="task" key={task.id}>
          <h3>{task.title}</h3>
          <p>{task.status}</p>
          <p>{task.priority}</p>
        </div>
      ))}
    </div>
  )
}

export default function ProjectBoard() {
  const project = useOutletContext<Project>();
  const [tasks, setTasks] = useState(initialTasks)
  
  return (
    <div className="project-board">
      <h2>Доска проекта {project.name}</h2>
      <Column tasks={tasks} />
    </div>
  );
}