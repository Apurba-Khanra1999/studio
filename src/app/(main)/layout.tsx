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
import {
  NotificationsContext,
  NOTIFICATIONS_LOCAL_STORAGE_KEY,
  generateId as generateNotificationId,
} from '@/hooks/use-notifications';
import { KanbanSquare, LayoutDashboard, Calendar, Search } from 'lucide-react';
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { QuickTaskEntry } from "@/components/quick-task-entry";
import { NotificationBell } from "@/components/notification-bell";
import * as React from 'react';
import type { Task, Status, Priority, Subtask, Notification } from '@/lib/types';
import { useTasks } from '@/hooks/use-tasks';
import { useNotifications } from '@/hooks/use-notifications';
import { Button } from "@/components/ui/button";
import { CommandPalette } from "@/components/command-palette";


function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    try {
      const item = window.localStorage.getItem(NOTIFICATIONS_LOCAL_STORAGE_KEY);
      if (item) {
        const parsedNotifications = JSON.parse(item, (key, value) => {
          if (key === 'timestamp' && value) {
            return new Date(value);
          }
          return value;
        });
        if (Array.isArray(parsedNotifications)) {
          setNotifications(parsedNotifications);
        }
      }
    } catch (error) {
      console.error("Failed to load notifications from localStorage", error);
    }
    setIsInitialized(true);
  }, []);

  React.useEffect(() => {
    if (isInitialized) {
      try {
        window.localStorage.setItem(NOTIFICATIONS_LOCAL_STORAGE_KEY, JSON.stringify(notifications));
      } catch (error) {
        console.error("Failed to save notifications to localStorage", error);
      }
    }
  }, [notifications, isInitialized]);

  const addNotification = React.useCallback((notificationData: { message: string }) => {
    const newNotification: Notification = {
      id: generateNotificationId(),
      timestamp: new Date(),
      read: false,
      ...notificationData,
    };
    // Keep the list from growing too large, e.g., max 20 notifications
    setNotifications(prev => [newNotification, ...prev].slice(0, 20));
  }, []);

  const markAllAsRead = React.useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const unreadCount = React.useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const value = { notifications, addNotification, markAllAsRead, unreadCount, isInitialized };

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

// This component uses the context, so it must be a child of TasksProvider
function MainLayoutContent({ children }: { children: React.ReactNode }) {
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const pathname = usePathname();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsCommandPaletteOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const navLinks = [
    { href: "/board", label: "Board", icon: KanbanSquare },
    { href: "/dashboard",label: "Dashboard", icon: LayoutDashboard },
    { href: "/calendar", label: "Calendar", icon: Calendar },
  ];

  return (
    <>
      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        setIsOpen={setIsCommandPaletteOpen}
        tasks={tasks}
        updateTask={updateTask}
        deleteTask={deleteTask}
      />
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
            <Button variant="outline" size="icon" onClick={() => setIsCommandPaletteOpen(true)} aria-label="Open command palette">
              <Search className="h-4 w-4" />
            </Button>
            <QuickTaskEntry addTask={addTask} />
            <NewTaskDialog addTask={addTask} />
            <NotificationBell />
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </>
  );
}


function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [isInitialized, setIsInitialized] = React.useState(false);

  const notificationsContext = useNotifications();

  React.useEffect(() => {
    try {
      const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (item) {
        let parsedTasks = JSON.parse(item, (key, value) => {
            if (key === 'dueDate' && value) {
                return new Date(value);
            }
            return value;
        });

        if (Array.isArray(parsedTasks)) {
          parsedTasks = parsedTasks.map(task => ({
            ...task,
            subtasks: task.subtasks || []
          }));
        }

        if (Array.isArray(parsedTasks) && parsedTasks.length > 0) {
            setTasks(parsedTasks);
        } else {
            setTasks(initialTasks.map(t => ({...t, subtasks: t.subtasks || []})));
        }
      } else {
        setTasks(initialTasks.map(t => ({...t, subtasks: t.subtasks || []})));
      }
    } catch (error) {
      console.error("Failed to load tasks from localStorage", error);
      setTasks(initialTasks.map(t => ({...t, subtasks: t.subtasks || []})));
    }
    setIsInitialized(true);
  }, []);

  React.useEffect(() => {
    if (isInitialized) {
      try {
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
    notificationsContext.addNotification({ message: `New task added: "${newTaskData.title}"` });
  }, [notificationsContext]);
  
  const updateTask = React.useCallback((taskId: string, updatedData: Partial<Omit<Task, 'id'>>) => {
    const taskToUpdate = tasks.find(task => task.id === taskId);

    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, ...updatedData } : task
      )
    );

    if (taskToUpdate) {
      if (updatedData.status && updatedData.status === 'Done' && taskToUpdate.status !== 'Done') {
        notificationsContext.addNotification({ message: `Task completed: "${taskToUpdate.title}"` });
      } else {
        notificationsContext.addNotification({ message: `Task updated: "${taskToUpdate.title}"` });
      }
    }
  }, [tasks, notificationsContext]);

  const deleteTask = React.useCallback((taskId: string) => {
    const taskToDelete = tasks.find(task => task.id === taskId);
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    if (taskToDelete) {
      notificationsContext.addNotification({ message: `Task deleted: "${taskToDelete.title}"` });
    }
  }, [tasks, notificationsContext]);

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

// The RootLayout now needs to include the NotificationsProvider
const RootLayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <NotificationsProvider>
      <MainLayout>{children}</MainLayout>
    </NotificationsProvider>
  );
};

export default RootLayoutWrapper;
