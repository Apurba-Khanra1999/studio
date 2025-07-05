"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Task, Status, Priority, Subtask } from '@/lib/types';

const LOCAL_STORAGE_KEY = 'taskflow-tasks';

const initialTasks: Task[] = [
    {
      id: 'task-1',
      title: 'Design the new landing page',
      description: 'Create a modern and responsive design for the new landing page, focusing on user engagement and conversion.',
      status: 'To Do',
      priority: 'High',
      subtasks: [
        { id: 'sub-1-1', text: 'Research competitor designs', completed: true },
        { id: 'sub-1-2', text: 'Create wireframes', completed: false },
        { id: 'sub-1-3', text: 'Develop mockups in Figma', completed: false },
      ],
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7))
    },
    {
      id: 'task-2',
      title: 'Develop user authentication',
      description: 'Implement secure user authentication using JWT and password hashing. Include sign-up, login, and logout functionality.',
      status: 'In Progress',
      priority: 'High',
      subtasks: [],
    },
    {
      id: 'task-3',
      title: 'Set up CI/CD pipeline',
      description: 'Configure a continuous integration and continuous deployment pipeline to automate testing and deployment.',
      status: 'In Progress',
      priority: 'Medium',
      subtasks: [
        { id: 'sub-3-1', text: 'Configure build server', completed: true },
        { id: 'sub-3-2', text: 'Set up automated tests', completed: true },
        { id: 'sub-3-3', text: 'Configure deployment script', completed: false },
      ],
    },
    {
      id: 'task-4',
      title: 'Write documentation for the API',
      description: 'Create comprehensive documentation for all API endpoints, including request/response examples.',
      status: 'Done',
      priority: 'Medium',
      subtasks: [],
      dueDate: new Date(new Date().setDate(new Date().getDate() - 5))
    },
    {
      id: 'task-5',
      title: 'Update footer with new links',
      description: 'Add the new social media links and privacy policy link to the website footer.',
      status: 'To Do',
      priority: 'Low',
      subtasks: [],
    }
  ];

const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (item) {
        let parsedTasks = JSON.parse(item, (key, value) => {
            if (key === 'dueDate' && value) {
                return new Date(value);
            }
            return value;
        });
        if (Array.isArray(parsedTasks) && parsedTasks.length > 0) {
            const sanitizedTasks = parsedTasks.map(task => ({ ...task, subtasks: task.subtasks || [] }));
            setTasks(sanitizedTasks);
        } else {
            setTasks(initialTasks);
        }
      } else {
        setTasks(initialTasks);
      }
    } catch (error) {
      console.error("Failed to load tasks from localStorage", error);
      setTasks(initialTasks);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
      } catch (error) {
        console.error("Failed to save tasks to localStorage", error);
      }
    }
  }, [tasks, isInitialized]);

  const addTask = useCallback((newTaskData: { title: string; description: string; priority: Priority; dueDate?: Date }) => {
    const newTask: Task = {
      id: `task-${generateId()}`,
      status: 'To Do',
      subtasks: [],
      ...newTaskData
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
  }, []);
  
  const updateTask = useCallback((taskId: string, updatedData: Partial<Omit<Task, 'id'>>) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, ...updatedData } : task
      )
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  }, []);

  const moveTask = useCallback((taskId: string, newStatus: Status) => {
    updateTask(taskId, { status: newStatus });
  }, [updateTask]);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks(prevTasks => prevTasks.map(task => {
        if (task.id === taskId) {
            return {
                ...task,
                subtasks: (task.subtasks || []).map(subtask => 
                    subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
                )
            };
        }
        return task;
    }));
  }, []);

  const addSubtask = useCallback((taskId: string, subtaskText: string) => {
    setTasks(prevTasks => prevTasks.map(task => {
        if (task.id === taskId) {
            const newSubtask: Subtask = {
                id: `sub-${generateId()}`,
                text: subtaskText,
                completed: false
            };
            return {
                ...task,
                subtasks: [...(task.subtasks || []), newSubtask]
            };
        }
        return task;
    }));
  }, []);

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks(prevTasks => prevTasks.map(task => {
        if (task.id === taskId) {
            return {
                ...task,
                subtasks: (task.subtasks || []).filter(subtask => subtask.id !== subtaskId)
            };
        }
        return task;
    }));
  }, []);


  return { tasks, addTask, updateTask, deleteTask, moveTask, addSubtask, deleteSubtask, toggleSubtask, isInitialized };
}
