"use client";

import { KanbanBoard } from '@/components/kanban-board';
import { NewTaskDialog } from '@/components/new-task-dialog';
import { useTasks } from '@/hooks/use-tasks';
import { KanbanSquare } from 'lucide-react';

export default function Home() {
  const { 
    tasks, 
    addTask, 
    updateTask,
    deleteTask,
    moveTask, 
    addSubtask,
    deleteSubtask,
    toggleSubtask,
    isInitialized 
  } = useTasks();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
        <div className="flex items-center gap-2">
          <KanbanSquare className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tight text-foreground">TaskFlow</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <NewTaskDialog addTask={addTask} />
        </div>
      </header>
      <main className="flex-1 overflow-x-auto">
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
      </main>
    </div>
  );
}
