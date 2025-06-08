import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Gantt, Willow, Link, Task as GanttTask } from 'wx-react-gantt';
import 'wx-react-gantt/dist/gantt.css';
import {
  Drawer,
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  Space,
  Slider,
  ConfigProvider
} from 'antd';
import {
  EditOutlined,
  CalendarOutlined,
  DeleteOutlined,
  PlusOutlined
} from '@ant-design/icons';
import ru_RU from 'antd/lib/locale/ru_RU';
import dayjs, { Dayjs } from 'dayjs';
import { nanoid } from 'nanoid';
import './styles/gantt.css';

// Типы
type Priority = 'High' | 'Medium' | 'Low';
type Status = 'NotStarted' | 'InProgress' | 'Completed';

interface ExtendedTask extends GanttTask {
  description: string;
  status: Status;
  priority: Priority;
  assignee?: string;
}

// Начальные данные
const initialTasks: ExtendedTask[] = [
  {
    id: 1,
    text: 'Проект Alpha',
    start: new Date(2025, 0, 1),
    end: new Date(2025, 0, 15),
    duration: 14,
    progress: 50,
    type: 'summary',
    parent: 0,
    open: true,
    priority: 'High',
    status: 'InProgress',
    description: 'Главный проект компании',
  },
  {
    id: 2,
    text: 'Сбор требований',
    start: new Date(2025, 0, 1),
    end: new Date(2025, 0, 5),
    duration: 4,
    progress: 0,
    type: 'urgent',
    parent: 1,
    priority: 'High',
    status: 'NotStarted',
    description: 'Процесс сбора и анализа требований',
  },
  {
    id: 3,
    text: 'Дизайн макетов',
    start: new Date(2025, 0, 6),
    end: new Date(2025, 0, 10),
    duration: 4,
    progress: 30,
    type: 'narrow',
    parent: 1,
    priority: 'Medium',
    status: 'InProgress',
    description: 'Разработка UI/UX макетов',
  },
  {
    id: 4,
    text: 'Релиз v1.0',
    start: new Date(2025, 0, 15),
    end: new Date(2025, 0, 15),
    duration: 0,
    progress: 0,
    type: 'milestone',
    parent: 1,
    priority: 'High',
    status: 'NotStarted',
    description: 'Веха: выкладка первой версии',
  },
];

const initialLinks: Link[] = [
  { id: 1, source: 2, target: 3, type: 'e2s' },
];

const GantPage: React.FC = () => {
  const apiRef = useRef<any>(null);
  const [tasks, setTasks] = useState<ExtendedTask[]>(initialTasks);
  const [links, setLinks] = useState<Link[]>(initialLinks);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ExtendedTask | null>(null);
  const [form] = Form.useForm();

  // Интерцептор один раз
  useEffect(() => {
    const api = apiRef.current;
    if (api?.intercept) {
      api.intercept('show-editor', (data: any) => {
        const task = { ...data, description: data.description ?? '' } as ExtendedTask;
        openEditDrawer(task);
        return false;
      });
    }
  }, []);

  // Открыть редактор (ремемоизирован)
  const openEditDrawer = useCallback((task: ExtendedTask) => {
    setEditingTask(task);
    form.resetFields();
    form.setFieldsValue({
      text: task.text,
      description: task.description,
      start: dayjs(task.start),
      end: dayjs(task.end),
      status: task.status,
      priority: task.priority,
      type: task.type,
      assignee: task.assignee,
      progress: task.progress,
    });
    setDrawerOpen(true);
  }, [form]);

  // Открыть для новой задачи
  const openAddDrawer = useCallback(() => {
    setEditingTask(null);
    form.resetFields();
    form.setFieldsValue({
      text: '',
      description: '',
      start: dayjs(),
      end: dayjs().add(1, 'day'),
      status: 'NotStarted',
      priority: 'Medium',
      type: 'task',
      assignee: '',
      progress: 0,
    });
    setDrawerOpen(true);
  }, [form]);

  // Сохранить задачу
  const handleSave = useCallback(async () => {
    const values = await form.validateFields();
    const start: Dayjs = values.start;
    const end: Dayjs = values.end;
    const newTask: ExtendedTask = {
      id: editingTask?.id ?? nanoid(),
      text: values.text,
      start: start.toDate(),
      end: end.toDate(),
      duration: end.diff(start, 'day'),
      progress: values.progress,
      type: values.type,
      parent: editingTask?.parent ?? 0,
      priority: values.priority,
      status: values.status,
      description: values.description,
      assignee: values.assignee,
    };

    if (editingTask) {
      setTasks(prev => prev.map(t => (t.id === newTask.id ? newTask : t)));
      apiRef.current?.exec('update-task', { id: newTask.id, task: newTask });
    } else {
      setTasks(prev => [...prev, newTask]);
      apiRef.current?.exec('add-task', { task: newTask });
    }

    setDrawerOpen(false);
  }, [editingTask, form]);

  // Удалить задачу
  const handleDelete = useCallback(() => {
    if (!editingTask) return;
    apiRef.current.exec('delete-task', { id: editingTask.id });
    setTasks(prev => prev.filter(t => t.id !== editingTask.id));
    setDrawerOpen(false);
  }, [editingTask]);

  // Клик по задаче
  const onTaskClick = useCallback((task: GanttTask) => {
    openEditDrawer(task as ExtendedTask);
  }, [openEditDrawer]);

  return (
    <ConfigProvider locale={ru_RU}>
      <Willow>
        <div className="gantt-container">
          <Space style={{ margin: 16 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={openAddDrawer}>
              Добавить задачу
            </Button>
          </Space>

          <Gantt
            apiRef={apiRef}
            tasks={tasks}
            links={links}
            taskTypes={[
              { id: 'task', label: 'Task' },
              { id: 'summary', label: 'Summary' },
              { id: 'milestone', label: 'Milestone' },
              { id: 'urgent', label: 'Urgent' },
              { id: 'narrow', label: 'Narrow' },
              { id: 'progress', label: 'Progress' },
            ]}
            zoom
            highlightTime={(date, unit) => {
              if (unit === 'day') {
                const today = new Date();
                if (date.toDateString() === today.toDateString()) return 'wx-today';
                if ([0, 6].includes(date.getDay())) return 'wx-weekend';
              }
              return '';
            }}
            onTaskClick={onTaskClick}
          />

          <Drawer
            title={editingTask ? 'Редактировать задачу' : 'Новая задача'}
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            width={400}
            destroyOnClose
          >
            <Form form={form} layout="vertical" onFinish={handleSave}>
              <Form.Item name="text" label="Название" rules={[{ required: true }]}>  
                <Input prefix={<EditOutlined />} />
              </Form.Item>

              <Form.Item name="description" label="Описание">
                <Input.TextArea rows={3} />
              </Form.Item>

              <Form.Item
                name="start"
                label="Начало"
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: '100%' }} suffixIcon={<CalendarOutlined />} />
              </Form.Item>

              <Form.Item
                name="end"
                label="Окончание"
                dependencies={["start"]}
                rules={[
                  { required: true },
                  ({ getFieldValue }) => ({
                    validator(_, value: Dayjs) {
                      const startValue = getFieldValue('start');
                      if (!value || value.isAfter(startValue)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Дата окончания должна быть позже даты начала'));
                    }
                  })
                ]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item name="status" label="Статус" rules={[{ required: true }]}>  
                <Select>
                  <Select.Option value="NotStarted">Не начато</Select.Option>
                  <Select.Option value="InProgress">В процессе</Select.Option>
                  <Select.Option value="Completed">Завершено</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item name="priority" label="Приоритет" rules={[{ required: true }]}>  
                <Select>
                  <Select.Option value="High">Высокий</Select.Option>
                  <Select.Option value="Medium">Средний</Select.Option>
                  <Select.Option value="Low">Низкий</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item name="type" label="Тип задачи" rules={[{ required: true }]}>  
                <Select>
                  <Select.Option value="task">Task</Select.Option>
                  <Select.Option value="summary">Summary</Select.Option>
                  <Select.Option value="milestone">Milestone</Select.Option>
                  <Select.Option value="urgent">Urgent</Select.Option>
                  <Select.Option value="narrow">Narrow</Select.Option>
                  <Select.Option value="progress">Progress</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item name="assignee" label="Исполнитель">
                <Select showSearch placeholder="Выберите исполнителя" />
              </Form.Item>

              <Form.Item name="progress" label="Прогресс (%)" rules={[{ required: true }]}>  
                <Slider min={0} max={100} tooltipVisible />
              </Form.Item>

              <Form.Item>
                <Space style={{ float: 'right' }}>
                  {editingTask && (
                    <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
                      Удалить
                    </Button>
                  )}
                  <Button type="primary" htmlType="submit">
                    Сохранить
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Drawer>
        </div>
      </Willow>
    </ConfigProvider>
  );
};

export default React.memo(GantPage);
