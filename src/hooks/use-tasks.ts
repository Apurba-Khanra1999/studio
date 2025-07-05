"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Task, Status, Priority } from '@/lib/types';

const LOCAL_STORAGE_KEY = 'taskflow-tasks';

const initialTasks: Task[] = [
    {
      id: 'task-1',
      title: 'Design the new landing page',
      description: 'Create a modern and responsive design for the new landing page, focusing on user engagement and conversion.',
      status: 'To Do',
      priority: 'High'
    },
    {
      id: 'task-2',
      title: 'Develop user authentication',
      description: 'Implement secure user authentication using JWT and password hashing. Include sign-up, login, and logout functionality.',
      status: 'In Progress',
      priority: 'High'
    },
    {
      id: 'task-3',
      title: 'Set up CI/CD pipeline',
      description: 'Configure a continuous integration and continuous deployment pipeline to automate testing and deployment.',
      status: 'In Progress',
      priority: 'Medium'
    },
    {
      id: 'task-4',
      title: 'Write documentation for the API',
      description: 'Create comprehensive documentation for all API endpoints, including request/response examples.',
      status: 'Done',
      priority: 'Medium'
    },
    {
      id: 'task-5',
      title: 'Update footer with new links',
      description: 'Add the new social media links and privacy policy link to the website footer.',
      status: 'To Do',
      priority: 'Low'
    }
  ];

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (item) {
        const parsedTasks = JSON.parse(item);
        if (parsedTasks.length > 0) {
            setTasks(parsedTasks);
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

  const addTask = useCallback((newTaskData: { title: string; description: string; priority: Priority; }) => {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      status: 'To Do',
      ...newTaskData
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
  }, []);
  
  const moveTask = useCallback((taskId: string, newStatus: Status) => {
    setTasks(prevTasks => {
      const taskIndex = prevTasks.findIndex(task => task.id === taskId);
      if (taskIndex === -1) return prevTasks;

      const taskToMove = prevTasks[taskIndex];
      const otherTasks = prevTasks.filter(task => task.id !== taskId);
      
      const updatedTask = { ...taskToMove, status: newStatus };

      return [...otherTasks, updatedTask];
    });
  }, []);

  return { tasks, addTask, moveTask, isInitialized };
}
