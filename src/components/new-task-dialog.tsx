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
import { Wand2, Loader2, Plus, Calendar as CalendarIcon, Trash2, Image as ImageIcon } from 'lucide-react';
import type { Priority, Subtask } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';

import { generateTaskDescription } from '@/ai/flows/generate-task-description';
import { determineTaskPriority } from '@/ai/flows/determine-task-priority';
import { generateSubtasks } from '@/ai/flows/generate-subtasks';
import { generateTaskImage } from '@/ai/flows/generate-task-image';

const taskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  description: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High"]),
  dueDate: z.date().optional(),
  subtasks: z.array(z.object({
    id: z.string(),
    text: z.string(),
    completed: z.boolean(),
  })).optional(),
  imageUrl: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface NewTaskDialogProps {
  addTask: (task: { title: string; description: string; priority: Priority; dueDate?: Date; subtasks: Subtask[]; imageUrl?: string; }) => void;
}

export function NewTaskDialog({ addTask }: NewTaskDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isDeterminingPriority, setIsDeterminingPriority] = useState(false);
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const { toast } = useToast();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "Medium",
      subtasks: [],
      imageUrl: undefined,
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
  
  const handleGenerateSubtasks = async () => {
    const title = form.getValues("title");
    if (!title) {
      form.setError("title", { message: "Please enter a title first." });
      return;
    }
    setIsGeneratingSubtasks(true);
    try {
      const result = await generateSubtasks({
        title,
        description: form.getValues('description') || '',
      });
      const newSubtasks: Subtask[] = result.subtasks.map((text) => ({
        id: `gen-${Date.now()}-${Math.random()}`,
        text,
        completed: false,
      }));
      const currentSubtasks = form.getValues('subtasks') || [];
      form.setValue('subtasks', [...currentSubtasks, ...newSubtasks]);
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

  const handleGenerateImage = async () => {
    const title = form.getValues("title");
    if (!title) {
      form.setError("title", { message: "Please enter a title first." });
      return;
    }
    setIsGeneratingImage(true);
    try {
      const result = await generateTaskImage({ title });
      form.setValue('imageUrl', result.imageUrl);
    } catch (error) {
      console.error("AI image generation failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate task image.",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleRemoveImage = () => {
    form.setValue('imageUrl', undefined);
  };


  const handleAddSubtask = () => {
    if (newSubtaskText.trim() === '') return;
    const newSubtask: Subtask = {
      id: `man-${Date.now()}`,
      text: newSubtaskText.trim(),
      completed: false,
    };
    const currentSubtasks = form.getValues('subtasks') || [];
    form.setValue('subtasks', [...currentSubtasks, newSubtask]);
    setNewSubtaskText('');
  };

  const handleToggleSubtask = (subtaskId: string) => {
    const currentSubtasks = form.getValues('subtasks') || [];
    const updatedSubtasks = currentSubtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s);
    form.setValue('subtasks', updatedSubtasks);
  };
  
  const handleDeleteSubtask = (subtaskId: string) => {
    const currentSubtasks = form.getValues('subtasks') || [];
    const updatedSubtasks = currentSubtasks.filter(s => s.id !== subtaskId);
    form.setValue('subtasks', updatedSubtasks);
  };

  const onSubmit = (data: TaskFormValues) => {
    addTask({ ...data, description: data.description || '', subtasks: data.subtasks || [] });
    form.reset();
    setIsOpen(false);
    toast({
      title: "Task Created",
      description: `"${data.title}" has been added to your board.`,
    })
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) form.reset();
      setIsOpen(open);
    }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 flex-shrink-0">
          <DialogTitle>Create a new task</DialogTitle>
          <DialogDescription>
            Fill in the details below. Use AI to help generate the description and set a priority.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 pb-6">
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
                            rows={4}
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

                <Separator />
                
                <div className="space-y-2">
                    <FormLabel>Task Image</FormLabel>
                    {form.watch('imageUrl') ? (
                    <div className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={form.getValues('imageUrl')}
                            alt="Generated task"
                            className="w-full h-48 object-cover rounded-md border"
                            data-ai-hint="task illustration"
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={handleRemoveImage}
                            >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    ) : (
                    <div className="flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed rounded-md">
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">No image has been generated for this task.</p>
                    </div>
                    )}
                    <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage || !form.getValues('title')}
                    >
                    {isGeneratingImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    {form.watch('imageUrl') ? 'Generate a new image with AI' : 'Generate an image with AI'}
                    </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <FormLabel>Subtasks</FormLabel>
                    <Button type="button" variant="outline" size="sm" onClick={handleGenerateSubtasks} disabled={isGeneratingSubtasks || !form.getValues('title')}>
                      {isGeneratingSubtasks ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                      Suggest with AI
                    </Button>
                  </div>
                  <div className="pl-1 space-y-2 max-h-40 overflow-y-auto pr-2">
                    {(form.watch('subtasks') || []).map((subtask) => (
                      <div key={subtask.id} className="flex items-center gap-3 group">
                        <Checkbox
                          id={`new-subtask-${subtask.id}`}
                          checked={subtask.completed}
                          onCheckedChange={() => handleToggleSubtask(subtask.id)}
                        />
                        <label
                          htmlFor={`new-subtask-${subtask.id}`}
                          className={cn("flex-1 text-sm cursor-pointer", subtask.completed && "line-through text-muted-foreground")}
                        >
                          {subtask.text}
                        </label>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            onClick={() => handleDeleteSubtask(subtask.id)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    ))}
                    {(form.watch('subtasks') || []).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No subtasks yet. Add one below or use AI!</p>
                      )}
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Input 
                        value={newSubtaskText} 
                        onChange={(e) => setNewSubtaskText(e.target.value)} 
                        onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); } }}
                        placeholder="Add a new subtask and press Enter"
                      />
                      <Button type="button" size="icon" onClick={handleAddSubtask}><Plus className="h-4 w-4"/></Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
        <DialogFooter className="p-6 pt-4 border-t flex-shrink-0">
          <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button type="submit" form="task-details-form" onClick={form.handleSubmit(onSubmit)}>Create Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
