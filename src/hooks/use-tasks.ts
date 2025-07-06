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
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      subtasks: [
        { id: 'sub-1-1', text: 'Define color palette', completed: true },
        { id: 'sub-1-2', text: 'Create wireframes', completed: true },
        { id: 'sub-1-3', text: 'Design hero section', completed: false },
      ],
      imageUrl: 'https://placehold.co/600x400.png',
    },
    {
      id: 'task-2',
      title: 'Develop user authentication',
      description: 'Implement secure user authentication using JWT and password hashing. Include sign-up, login, and logout functionality.',
      status: 'In Progress',
      priority: 'High',
      subtasks: [],
      imageUrl: 'https://placehold.co/600x400.png',
    },
    {
      id: 'task-3',
      title: 'Set up CI/CD pipeline',
      description: 'Configure a continuous integration and continuous deployment pipeline to automate testing and deployment.',
      status: 'In Progress',
      priority: 'Medium',
      subtasks: []
    },
    {
      id: 'task-4',
      title: 'Write documentation for the API',
      description: 'Create comprehensive documentation for all API endpoints, including request/response examples.',
      status: 'Done',
      priority: 'Medium',
      dueDate: new Date(new Date().setDate(new Date().getDate() - 5)),
      subtasks: []
    },
    {
      id: 'task-5',
      title: 'Update footer with new links',
      description: 'Add the new social media links and privacy policy link to the website footer.',
      status: 'To Do',
      priority: 'Low',
      subtasks: []
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

        if (Array.isArray(parsedTasks)) {
          parsedTasks = parsedTasks.map(task => ({
            ...task,
            subtasks: task.subtasks || []
          }));
        }

        if (Array.isArray(parsedTasks) && parsedTasks.length > 0) {
            setTasks(parsedTasks);
        } else {
            setTasks(initialTasks.map(t => ({...t, subtasks: t.subtasks || []})));
        }
      } else {
        setTasks(initialTasks.map(t => ({...t, subtasks: t.subtasks || []})));
      }
    } catch (error) {
      console.error("Failed to load tasks from localStorage", error);
      setTasks(initialTasks.map(t => ({...t, subtasks: t.subtasks || []})));
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

  const addTask = useCallback((newTaskData: { title: string; description: string; priority: Priority; dueDate?: Date; subtasks: Subtask[], imageUrl?: string; }) => {
    const newTask: Task = {
      id: `task-${generateId()}`,
      status: 'To Do',
      ...newTaskData,
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

  return { tasks, addTask, updateTask, deleteTask, moveTask, isInitialized };
}
