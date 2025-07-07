"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NewTaskDialog } from '@/components/new-task-dialog';
import { 
  TasksContext,
  initialTasks,
  LOCAL_STORAGE_KEY,
  generateId,
} from '@/hooks/use-tasks';
import { KanbanSquare, LayoutDashboard, Calendar, Bot } from 'lucide-react';
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { QuickTaskEntry } from "@/components/quick-task-entry";
import * as React from 'react';
import type { Task, Status, Priority, Subtask } from '@/lib/types';
import { useTasks } from '@/hooks/use-tasks';


// This component uses the context, so it must be a child of TasksProvider
function MainLayoutContent({ children }: { children: React.ReactNode }) {
  const { addTask } = useTasks();
  const pathname = usePathname();

  const navLinks = [
    { href: "/board", label: "Board", icon: KanbanSquare },
    { href: "/dashboard",label: "Dashboard", icon: LayoutDashboard },
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/assistant", label: "Assistant", icon: Bot },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
        <div className="flex items-center gap-2">
          <KanbanSquare className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tight text-foreground">TaskFlow</h1>
        </div>

        <nav className="ml-6 flex items-center space-x-4 lg:space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                pathname === link.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <QuickTaskEntry addTask={addTask} />
          <NewTaskDialog addTask={addTask} />
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}


export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    try {
      const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (item) {
        let parsedTasks = JSON.parse(item, (key, value) => {
            // This reviver function ensures dueDate strings are converted back to Date objects
            if (key === 'dueDate' && value) {
                // new Date(value) is robust enough for ISO strings
                return new Date(value);
            }
            return value;
        });

        // Ensure subtasks is always an array
        if (Array.isArray(parsedTasks)) {
          parsedTasks = parsedTasks.map(task => ({
            ...task,
            subtasks: task.subtasks || []
          }));
        }

        if (Array.isArray(parsedTasks) && parsedTasks.length > 0) {
            setTasks(parsedTasks);
        } else {
            // If localStorage is empty or invalid, load initial sample data
            setTasks(initialTasks.map(t => ({...t, subtasks: t.subtasks || []})));
        }
      } else {
        // If no item in localStorage, load initial sample data
        setTasks(initialTasks.map(t => ({...t, subtasks: t.subtasks || []})));
      }
    } catch (error) {
      console.error("Failed to load tasks from localStorage", error);
      // Fallback to initial data on error
      setTasks(initialTasks.map(t => ({...t, subtasks: t.subtasks || []})));
    }
    setIsInitialized(true);
  }, []);

  React.useEffect(() => {
    if (isInitialized) {
      try {
        // This will automatically convert Date objects to ISO strings
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
      } catch (error) {
        console.error("Failed to save tasks to localStorage", error);
      }
    }
  }, [tasks, isInitialized]);

  const addTask = React.useCallback((newTaskData: { title: string; description: string; priority: Priority; dueDate?: Date; subtasks: Subtask[], imageUrl?: string; }) => {
    const newTask: Task = {
      id: `task-${generateId()}`,
      status: 'To Do',
      ...newTaskData,
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
  }, []);
  
  const updateTask = React.useCallback((taskId: string, updatedData: Partial<Omit<Task, 'id'>>) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, ...updatedData } : task
      )
    );
  }, []);

  const deleteTask = React.useCallback((taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  }, []);

  const moveTask = React.useCallback((taskId: string, newStatus: Status) => {
    updateTask(taskId, { status: newStatus });
  }, [updateTask]);

  const value = { tasks, setTasks, addTask, updateTask, deleteTask, moveTask, isInitialized };
  
  return (
    <TasksContext.Provider value={value}>
      <MainLayoutContent>
        {children}
      </MainLayoutContent>
    </TasksContext.Provider>
  );
}
