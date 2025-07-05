"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NewTaskDialog } from '@/components/new-task-dialog';
import { useTasks } from '@/hooks/use-tasks';
import { KanbanSquare, LayoutDashboard } from 'lucide-react';
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { addTask } = useTasks();
  const pathname = usePathname();

  const navLinks = [
    { href: "/board", label: "Board", icon: KanbanSquare },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
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
          <NewTaskDialog addTask={addTask} />
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
