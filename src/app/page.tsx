import { KanbanBoard } from '@/components/kanban-board';
import { Leaf } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <div className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">TaskFlow</h1>
        </div>
      </header>
      <main className="flex-1 overflow-x-auto">
        <KanbanBoard />
      </main>
    </div>
  );
}
