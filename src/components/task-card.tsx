"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Task, Priority } from '@/lib/types';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
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


export function TaskCard({ task }: TaskCardProps) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('taskId', task.id);
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
  };

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="cursor-grab active:cursor-grabbing transition-shadow duration-200 hover:shadow-lg"
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
        <CardDescription className="line-clamp-3">{task.description}</CardDescription>
      </CardContent>
    </Card>
  );
}
