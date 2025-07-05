"use client";

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Wand2, Loader2, Plus, Trash2, Calendar as CalendarIcon, X } from 'lucide-react';
import type { Task, Status } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { generateSubtasks } from '@/ai/flows/generate-subtasks';

const statuses: Status[] = ["To Do", "In Progress", "Done"];

const taskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  description: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High"]),
  status: z.enum(["To Do", "In Progress", "Done"]),
  dueDate: z.date().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskDetailsDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  task: Task;
  updateTask: (taskId: string, data: Partial<Omit<Task, 'id'>>) => void;
  deleteTask: (taskId:string) => void;
  addSubtask: (taskId: string, subtaskText: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
}

export function TaskDetailsDialog({ isOpen, setIsOpen, task, updateTask, deleteTask, addSubtask, deleteSubtask, toggleSubtask }: TaskDetailsDialogProps) {
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const { toast } = useToast();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    values: useMemo(() => ({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined
    }), [task])
  });

  useEffect(() => {
    form.reset({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined
    });
  }, [task, form]);


  const handleGenerateSubtasks = async () => {
    setIsGeneratingSubtasks(true);
    try {
      const result = await generateSubtasks({ title: task.title, description: task.description || '' });
      result.subtasks.forEach(subtaskText => {
        addSubtask(task.id, subtaskText);
      });
      toast({
          title: "AI Subtasks Added",
          description: `${result.subtasks.length} subtasks have been generated.`
      })
    } catch (error) {
      console.error("AI subtask generation failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate subtasks.",
      });
    } finally {
      setIsGeneratingSubtasks(false);
    }
  };
  
  const handleAddSubtask = () => {
    if (newSubtaskText.trim()) {
        addSubtask(task.id, newSubtaskText.trim());
        setNewSubtaskText("");
    }
  }

  const handleDeleteTask = () => {
    deleteTask(task.id);
    toast({
        title: "Task Deleted",
        description: `"${task.title}" has been removed.`,
    })
    setIsOpen(false);
  }

  const onSubmit = (data: TaskFormValues) => {
    updateTask(task.id, data);
    setIsOpen(false);
    toast({
      title: "Task Updated",
      description: `"${data.title}" has been saved.`,
    })
  };

  const subtasks = task.subtasks || [];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
          <DialogDescription>
            View, edit, or delete this task. Manage subtasks below.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-6 -mr-6">
        <Form {...form}>
          <form id="task-details-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
               <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn("pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/>
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
            </div>
             <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Subtasks</h3>
                    <Button type="button" variant="ghost" size="sm" onClick={handleGenerateSubtasks} disabled={isGeneratingSubtasks}>
                        {isGeneratingSubtasks ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
                        Suggest
                    </Button>
                </div>
                <div className="space-y-2">
                    {subtasks.map(subtask => (
                        <div key={subtask.id} className="flex items-center gap-2 group">
                            <Checkbox id={subtask.id} checked={subtask.completed} onCheckedChange={() => toggleSubtask(task.id, subtask.id)} />
                            <label htmlFor={subtask.id} className={cn("flex-grow text-sm", subtask.completed && "line-through text-muted-foreground")}>{subtask.text}</label>
                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => deleteSubtask(task.id, subtask.id)}><X className="h-4 w-4" /></Button>
                        </div>
                    ))}
                </div>
                 <div className="flex items-center gap-2 pt-2">
                    <Input 
                      value={newSubtaskText} 
                      onChange={(e) => setNewSubtaskText(e.target.value)} 
                      placeholder="Add a new subtask..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddSubtask();
                        }
                      }}
                    />
                    <Button type="button" size="icon" onClick={handleAddSubtask}><Plus className="h-4 w-4"/></Button>
                 </div>
             </div>
          </form>
        </Form>
        </ScrollArea>
        <DialogFooter className="pt-4 border-t">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                     <Button type="button" variant="destructive" className="mr-auto">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Task
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this task and all its data.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteTask}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button type="submit" form="task-details-form" onClick={form.handleSubmit(onSubmit)}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
