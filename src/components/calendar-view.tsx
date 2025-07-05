"use client";

import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskDetailsDialog } from '@/components/task-details-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Task, Priority, Status } from '@/lib/types';
import { isSameDay, format } from 'date-fns';
import type { DayContentProps } from 'react-day-picker';
import { ArrowDown, ArrowUp, Minus, ListTodo, Loader2, CheckCircle2, CalendarCheck } from 'lucide-react';

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

const statusIcons: Record<Status, React.ReactNode> = {
  'To Do': <ListTodo className="h-4 w-4 text-muted-foreground" />,
  'In Progress': <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--chart-2))]" />,
  'Done': <CheckCircle2 className="h-4 w-4 text-[hsl(var(--chart-3))]" />,
};


const CalendarTaskItem = ({ task, onSelect }: { task: Task, onSelect: () => void }) => (
  <button onClick={onSelect} className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors block border-b last:border-b-0">
    <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
            {statusIcons[task.status]}
        </div>
        <div className="flex-1 overflow-hidden">
            <p className="font-semibold text-sm truncate">{task.title}</p>
        </div>
        <Badge variant="outline" className={cn("flex shrink-0 items-center gap-1 font-semibold text-xs", priorityStyles[task.priority])}>
            {priorityIcons[task.priority]}
            {task.priority}
        </Badge>
    </div>
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
      .filter(task => task.dueDate && isSameDay(new Date(task.dueDate), selectedDate))
      .sort((a,b) => {
          const statusOrder: Record<Status, number> = { "In Progress": 1, "To Do": 2, "Done": 3 };
          return statusOrder[a.status] - statusOrder[b.status];
      });
  }, [tasksWithDueDate, selectedDate]);
  
  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };
  
  const DayWithDot = React.useCallback(({ date, activeModifiers }: DayContentProps) => {
    const dayTasks = tasksWithDueDate.filter(task => task.dueDate && isSameDay(new Date(task.dueDate), date));
    
    return (
        <div className="relative h-full w-full flex items-center justify-center">
            {format(date, 'd')}
            {dayTasks.length > 0 && !activeModifiers.selected && (
                <div className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
            )}
        </div>
    );
  }, [tasksWithDueDate]);

  if (!isInitialized) {
    return (
      <div className="grid md:grid-cols-2 gap-6 h-full">
        <Skeleton className="h-[500px] w-full" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
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
       <div className="grid md:grid-cols-2 gap-6 h-full max-h-[calc(100vh-10rem)]">
        <Card className="h-full flex flex-col">
          <CardHeader>
             <CardTitle>Calendar</CardTitle>
             <CardDescription>Click a date to see tasks with due dates.</CardDescription>
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
              components={{
                DayContent: DayWithDot
              }}
            />
          </CardContent>
        </Card>
        
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'No date selected'}
            </CardTitle>
            <CardDescription>
              {selectedDate ? `${tasksForSelectedDay.length} task(s) due on this day.` : 'Select a day to see tasks.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <ScrollArea className="h-full">
              <div className="px-2 pb-2">
                {tasksForSelectedDay.length > 0 ? (
                  tasksForSelectedDay.map(task => (
                    <CalendarTaskItem key={task.id} task={task} onSelect={() => handleTaskSelect(task)} />
                  ))
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-16 px-4 flex flex-col items-center justify-center gap-4">
                    <CalendarCheck className="h-12 w-12 text-muted-foreground/50" />
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
