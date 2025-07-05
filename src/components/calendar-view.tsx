"use client";

import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskDetailsDialog } from '@/components/task-details-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Task, Priority } from '@/lib/types';
import { isSameDay, format } from 'date-fns';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  updateTask: (taskId: string, data: Partial<Omit<Task, 'id'>>) => void;
  deleteTask: (taskId: string) => void;
  isInitialized: boolean;
}

const priorityIcons: Record<Priority, React.ReactNode> = {
  Low: <ArrowDown className="h-4 w-4" />,
  Medium: <Minus className="h-4 w-4" />,
  High: <ArrowUp className="h-4 w-4" />,
};

const priorityStyles: Record<Priority, string> = {
  High: "text-destructive border-destructive/30 bg-destructive/10 hover:bg-destructive/20",
  Medium: "text-amber-600 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 dark:text-amber-400 dark:border-amber-400/30 dark:bg-amber-400/10 dark:hover:bg-amber-400/20",
  Low: "text-muted-foreground border-border bg-muted hover:bg-muted/80",
};

const CalendarTaskItem = ({ task, onSelect }: { task: Task, onSelect: () => void }) => (
  <button onClick={onSelect} className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors block border-b last:border-b-0">
    <div className="flex justify-between items-start">
      <p className="font-semibold text-sm truncate pr-2">{task.title}</p>
      <Badge variant="outline" className={cn("flex shrink-0 items-center gap-1 font-semibold text-xs", priorityStyles[task.priority])}>
        {priorityIcons[task.priority]}
        {task.priority}
      </Badge>
    </div>
    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{task.description}</p>
  </button>
);


export function CalendarView({ tasks, updateTask, deleteTask, isInitialized }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const tasksWithDueDate = React.useMemo(() => tasks.filter(task => !!task.dueDate), [tasks]);
  
  const tasksForSelectedDay = React.useMemo(() => {
    if (!selectedDate) return [];
    return tasksWithDueDate
      .filter(task => task.dueDate && isSameDay(task.dueDate, selectedDate))
      .sort((a,b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  }, [tasksWithDueDate, selectedDate]);
  
  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  if (!isInitialized) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 h-full">
        <div className="lg:col-span-2">
          <Skeleton className="h-[500px] w-full" />
        </div>
        <div>
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-20 w-full mb-2" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  return (
    <>
      {selectedTask && (
        <TaskDetailsDialog
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          task={selectedTask}
          updateTask={updateTask}
          deleteTask={deleteTask}
        />
      )}
       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 h-full max-h-[calc(100vh-8rem)]">
        <Card className="lg:col-span-2 h-full flex flex-col">
          <CardHeader>
             <CardTitle>Calendar</CardTitle>
             <CardDescription>Tasks with due dates are shown here. Click a date to see tasks.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex justify-center items-start pt-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="p-0"
              classNames={{
                day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90",
                day_today: "bg-accent text-accent-foreground",
              }}
              modifiers={{
                due: tasksWithDueDate.map(task => task.dueDate!),
              }}
              modifiersStyles={{
                due: {
                  border: `2px solid hsl(var(--primary))`,
                  borderRadius: '9999px',
                },
              }}
            />
          </CardContent>
        </Card>
        
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'No date selected'}
            </CardTitle>
            <CardDescription>Tasks due on this day.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <ScrollArea className="h-full">
              <div className="px-2 pb-2">
                {tasksForSelectedDay.length > 0 ? (
                  tasksForSelectedDay.map(task => (
                    <CalendarTaskItem key={task.id} task={task} onSelect={() => handleTaskSelect(task)} />
                  ))
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-16 px-4">
                    <p>{selectedDate ? "No tasks due on this day." : "Select a day to see tasks."}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
