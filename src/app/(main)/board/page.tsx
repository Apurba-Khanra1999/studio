"use client";

import * as React from 'react';
import { KanbanBoard } from '@/components/kanban-board';
import { useTasks } from '@/hooks/use-tasks';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { Priority } from '@/lib/types';

export default function BoardPage() {
  const { 
    tasks, 
    updateTask,
    deleteTask,
    moveTask, 
    isInitialized 
  } = useTasks();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [priorityFilter, setPriorityFilter] = React.useState<Priority[]>([]);

  const filteredTasks = React.useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = searchTerm === '' || 
                            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesPriority = priorityFilter.length === 0 || priorityFilter.includes(task.priority);

      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchTerm, priorityFilter]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setPriorityFilter([]);
  };
  
  const hasActiveFilters = searchTerm !== '' || priorityFilter.length > 0;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 md:p-6 border-b">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-4">
           <ToggleGroup 
              type="multiple"
              variant="outline"
              value={priorityFilter}
              onValueChange={(value: Priority[]) => {
                setPriorityFilter(value);
              }}
              aria-label="Filter by priority"
            >
              <ToggleGroupItem value="High" aria-label="High priority">High</ToggleGroupItem>
              <ToggleGroupItem value="Medium" aria-label="Medium priority">Medium</ToggleGroupItem>
              <ToggleGroupItem value="Low" aria-label="Low priority">Low</ToggleGroupItem>
           </ToggleGroup>
          
          {hasActiveFilters && (
            <Button variant="ghost" onClick={handleClearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>
      <KanbanBoard 
        tasks={filteredTasks} 
        moveTask={moveTask} 
        updateTask={updateTask}
        deleteTask={deleteTask}
        isInitialized={isInitialized} 
      />
    </>
  );
}
