"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Task, Priority } from '@/lib/types';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

interface TaskCardProps {
  task: Task;
}

const priorityIcons: Record<Priority, React.ReactNode> = {
  Low: <ArrowDown className="h-4 w-4 text-green-500" />,
  Medium: <Minus className="h-4 w-4 text-yellow-500" />,
  High: <ArrowUp className="h-4 w-4 text-red-500" />,
};

const priorityColors: Record<Priority, string> = {
    Low: 'bg-green-100 text-green-800 border-green-200',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    High: 'bg-red-100 text-red-800 border-red-200'
}

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
        <CardTitle className="flex items-center justify-between text-base">
            {task.title}
             <Badge variant="outline" className={`flex items-center gap-1 ${priorityColors[task.priority]}`}>
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
