"use client";

import { KanbanBoard } from '@/components/kanban-board';
import { NewTaskDialog } from '@/components/new-task-dialog';
import { useTasks } from '@/hooks/use-tasks';
import { KanbanSquare } from 'lucide-react';

export default function Home() {
  const { tasks, addTask, moveTask, isInitialized } = useTasks();

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <div className="flex items-center gap-2">
          <KanbanSquare className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">TaskFlow</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <NewTaskDialog addTask={addTask} />
        </div>
      </header>
      <main className="flex-1 overflow-x-auto">
        <KanbanBoard tasks={tasks} moveTask={moveTask} isInitialized={isInitialized} />
      </main>
    </div>
  );
}
