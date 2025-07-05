"use client";

import { useMemo } from 'react';
import { useTasks } from '@/hooks/use-tasks';
import { KanbanColumn } from '@/components/kanban-column';
import { NewTaskDialog } from '@/components/new-task-dialog';
import type { Status } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

const statuses: Status[] = ["To Do", "In Progress", "Done"];

export function KanbanBoard() {
  const { tasks, addTask, moveTask, isInitialized } = useTasks();

  const groupedTasks = useMemo(() => {
    const groups: Record<Status, typeof tasks> = {
      "To Do": [],
      "In Progress": [],
      "Done": [],
    };
    tasks.forEach(task => {
      groups[task.status].push(task);
    });
    return groups;
  }, [tasks]);

  if (!isInitialized) {
    return (
      <div className="flex h-full flex-1 p-4 md:p-6 gap-6">
        {statuses.map(status => (
          <div key={status} className="flex flex-col w-full md:w-1/3 lg:w-1/4 xl:w-1/5 shrink-0">
             <Skeleton className="h-8 w-1/2 mb-4" />
             <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
             </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-1 flex-col">
       <div className="flex justify-end p-4">
          <NewTaskDialog addTask={addTask} />
        </div>
      <div className="flex flex-1 items-start gap-6 p-4 md:p-6 pt-0">
        {statuses.map(status => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={groupedTasks[status]}
            moveTask={moveTask}
          />
        ))}
      </div>
    </div>
  );
}
