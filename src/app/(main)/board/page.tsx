"use client";

import * as React from 'react';
import { KanbanBoard } from '@/components/kanban-board';
import { useTasks } from '@/hooks/use-tasks';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { Priority } from '@/lib/types';
import { isPast, isToday, isThisWeek } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';


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
  const [dateFilter, setDateFilter] = React.useState('all');
  const [compactView, setCompactView] = React.useState(false);

  const filteredTasks = React.useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = searchTerm === '' || 
                            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesPriority = priorityFilter.length === 0 || priorityFilter.includes(task.priority);

      const matchesDate = (() => {
        if (!dateFilter || dateFilter === 'all') return true;
        if (dateFilter === 'no-due-date') return !task.dueDate;
        if (!task.dueDate) return false;

        const dueDate = new Date(task.dueDate);
        // A task due today is not considered past.
        if (dateFilter === 'overdue') return isPast(dueDate) && !isToday(dueDate) && task.status !== 'Done';
        if (dateFilter === 'today') return isToday(dueDate);
        if (dateFilter === 'this-week') return isThisWeek(dueDate, { weekStartsOn: 1 }); // Assuming week starts on Monday
        
        return true;
      })();

      return matchesSearch && matchesPriority && matchesDate;
    });
  }, [tasks, searchTerm, priorityFilter, dateFilter]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setPriorityFilter([]);
    setDateFilter('all');
  };
  
  const hasActiveFilters = searchTerm !== '' || priorityFilter.length > 0 || dateFilter !== 'all';

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
        <div className="flex items-center gap-2">
           <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                  {hasActiveFilters && <span className="ml-2 h-2 w-2 rounded-full bg-primary animate-pulse" />}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Filters</h4>
                        <p className="text-sm text-muted-foreground">
                          Refine your task board.
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label>Priority</Label>
                          <div className="col-span-2">
                            <ToggleGroup 
                                type="multiple"
                                variant="outline"
                                size="sm"
                                value={priorityFilter}
                                onValueChange={(value: Priority[]) => setPriorityFilter(value)}
                                aria-label="Filter by priority"
                                className="w-full"
                              >
                                <ToggleGroupItem value="High" aria-label="High priority" className="w-full">High</ToggleGroupItem>
                                <ToggleGroupItem value="Medium" aria-label="Medium priority" className="w-full">Med</ToggleGroupItem>
                                <ToggleGroupItem value="Low" aria-label="Low priority" className="w-full">Low</ToggleGroupItem>
                            </ToggleGroup>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label>Due Date</Label>
                            <Select value={dateFilter} onValueChange={setDateFilter}>
                                <SelectTrigger className="col-span-2">
                                  <SelectValue placeholder="Filter by date" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Any Time</SelectItem>
                                    <SelectItem value="overdue">Overdue</SelectItem>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="this-week">This Week</SelectItem>
                                    <SelectItem value="no-due-date">No Due Date</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                        <X className="h-4 w-4 mr-2" />
                        Clear All Filters
                      </Button>
                    )}
                  </div>
              </PopoverContent>
           </Popover>
          
           <div className="flex items-center space-x-2">
              <Switch id="compact-view" checked={compactView} onCheckedChange={setCompactView} />
              <Label htmlFor="compact-view" className="text-sm font-medium">Compact View</Label>
            </div>
        </div>
      </div>
      <KanbanBoard 
        tasks={filteredTasks} 
        moveTask={moveTask} 
        updateTask={updateTask}
        deleteTask={deleteTask}
        isInitialized={isInitialized}
        compactView={compactView}
      />
    </>
  );
}
