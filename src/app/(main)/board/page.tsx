"use client";

import { KanbanBoard } from '@/components/kanban-board';
import { useTasks } from '@/hooks/use-tasks';

export default function BoardPage() {
  const { 
    tasks, 
    updateTask,
    deleteTask,
    moveTask, 
    addSubtask,
    deleteSubtask,
    toggleSubtask,
    isInitialized 
  } = useTasks();

  return (
    <KanbanBoard 
      tasks={tasks} 
      moveTask={moveTask} 
      updateTask={updateTask}
      deleteTask={deleteTask}
      addSubtask={addSubtask}
      deleteSubtask={deleteSubtask}
      toggleSubtask={toggleSubtask}
      isInitialized={isInitialized} 
    />
  );
}
