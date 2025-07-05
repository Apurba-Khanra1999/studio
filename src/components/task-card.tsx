"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Task, Priority, Subtask } from '@/lib/types';
import { ArrowDown, ArrowUp, Calendar, CheckCircle2, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { TaskDetailsDialog } from './task-details-dialog';

interface TaskCardProps {
  task: Task;
  updateTask: (taskId: string, data: Partial<Omit<Task, 'id'>>) => void;
  deleteTask: (taskId: string) => void;
  addSubtask: (taskId: string, subtaskText: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
}

const priorityIcons: Record<Priority, React.ReactNode> = {
  Low: <ArrowDown className="h-4 w-4" />,
  Medium: <Minus className="h-4 w-4" />,
  High: <ArrowUp className="h-4 w-4" />,
};

const priorityStyles: Record<Priority, string> = {
  High: "text-destructive border-destructive/30 bg-destructive/10 hover:bg-destructive/20",
  Medium: "text-primary border-primary/40 bg-primary/10 hover:bg-primary/20",
  Low: "text-muted-foreground border-border bg-muted hover:bg-muted/80",
};


export function TaskCard({ task, ...props }: TaskCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('taskId', task.id);
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
  };

  const completedSubtasks = task.subtasks.filter(s => s.completed).length;

  return (
    <>
      <TaskDetailsDialog isOpen={isDetailsOpen} setIsOpen={setIsDetailsOpen} task={task} {...props} />
      <Card
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={() => setIsDetailsOpen(true)}
        className="cursor-pointer active:cursor-grabbing transition-shadow duration-200 hover:shadow-lg"
      >
        <CardHeader>
          <CardTitle className="flex items-start justify-between text-base gap-2">
              <span className="flex-1">{task.title}</span>
               <Badge variant="outline" className={cn("flex shrink-0 items-center gap-1", priorityStyles[task.priority])}>
                  {priorityIcons[task.priority]}
                  {task.priority}
              </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="line-clamp-2">{task.description}</CardDescription>
        </CardContent>
        <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(task.dueDate), "MMM d")}</span>
              </div>
            )}
          </div>
          {task.subtasks.length > 0 && (
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>{completedSubtasks}/{task.subtasks.length}</span>
            </div>
          )}
        </CardFooter>
      </Card>
    </>
  );
}
