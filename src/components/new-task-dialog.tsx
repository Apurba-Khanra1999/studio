"use client";

import { useState } from 'react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Wand2, Loader2, Plus, Calendar as CalendarIcon } from 'lucide-react';
import type { Priority } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

import { generateTaskDescription } from '@/ai/flows/generate-task-description';
import { determineTaskPriority } from '@/ai/flows/determine-task-priority';

const taskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  description: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High"]),
  dueDate: z.date().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface NewTaskDialogProps {
  addTask: (task: { title: string; description: string; priority: Priority; dueDate?: Date }) => void;
}

export function NewTaskDialog({ addTask }: NewTaskDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isDeterminingPriority, setIsDeterminingPriority] = useState(false);
  const { toast } = useToast();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "Medium",
    },
  });

  const handleGenerateDescription = async () => {
    const title = form.getValues("title");
    if (!title) {
      form.setError("title", { message: "Please enter a title first." });
      return;
    }

    setIsGeneratingDesc(true);
    try {
      const result = await generateTaskDescription({ title });
      form.setValue("description", result.description);
    } catch (error) {
      console.error("AI description generation failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate task description.",
      });
    } finally {
      setIsGeneratingDesc(false);
    }
  };
  
  const handleDeterminePriority = async () => {
    const title = form.getValues("title");
    const description = form.getValues("description") || "";
    
    if (!title) {
      form.setError("title", { message: "Please enter a title to suggest a priority." });
      return;
    }

    setIsDeterminingPriority(true);
    try {
      const result = await determineTaskPriority({ title, description });
      form.setValue("priority", result.priority);
    } catch (error) {
      console.error("AI priority determination failed:", error);
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to determine task priority.",
      });
    } finally {
      setIsDeterminingPriority(false);
    }
  };

  const onSubmit = (data: TaskFormValues) => {
    addTask({ ...data, description: data.description || '' });
    form.reset();
    setIsOpen(false);
    toast({
      title: "Task Created",
      description: `"${data.title}" has been added to your board.`,
    })
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Create a new task</DialogTitle>
          <DialogDescription>
            Fill in the details below. Use AI to help generate the description and set a priority.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Implement user authentication" {...field} />
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
                    <div className="relative">
                      <Textarea
                        placeholder="A detailed description of the task..."
                        className="resize-none pr-10"
                        rows={5}
                        {...field}
                      />
                       <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="absolute right-2 top-2 h-7 w-7"
                        onClick={handleGenerateDescription}
                        disabled={isGeneratingDesc || !form.getValues("title")}
                        aria-label="Generate description with AI"
                      >
                        {isGeneratingDesc ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Wand2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="flex items-center gap-2">
                      <span>Priority</span>
                       <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-5 w-5"
                          onClick={handleDeterminePriority}
                          disabled={isDeterminingPriority || !form.getValues("title")}
                          aria-label="Suggest priority with AI"
                        >
                          {isDeterminingPriority ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Wand2 className="h-3 w-3" />
                          )}
                        </Button>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
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
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0,0,0,0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <DialogFooter>
              <Button type="submit">Create Task</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
