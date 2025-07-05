"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Task, Status, Priority } from '@/lib/types';

const LOCAL_STORAGE_KEY = 'taskflow-tasks';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (item) {
        setTasks(JSON.parse(item));
      }
    } catch (error) {
      console.error("Failed to load tasks from localStorage", error);
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
      const updatedTask = { ...taskToMove, status: newStatus };

      const newTasks = [...prevTasks];
      newTasks.splice(taskIndex, 1);
      newTasks.push(updatedTask); // Add to the end of the list

      return newTasks;
    });
  }, []);

  return { tasks, addTask, moveTask, isInitialized };
}
