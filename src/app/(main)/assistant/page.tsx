"use client";

import * as React from 'react';
import { useTasks } from '@/hooks/use-tasks';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { runAssistant, type AssistantInput } from '@/ai/flows/assistant-flow';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/types';


interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export default function AssistantPage() {
    const { tasks, setTasks, isInitialized } = useTasks();
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [input, setInput] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const scrollAreaRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Convert Date objects to strings for the flow
            const tasksAsJson = tasks.map(task => ({
                ...task,
                dueDate: task.dueDate?.toISOString().split('T')[0],
            })) as unknown as AssistantInput['tasks'];

            const result = await runAssistant({ query: input, tasks: tasksAsJson });

            // Convert dueDate strings back to Date objects
            const updatedTasksWithDates = result.tasks.map((task: any) => ({
                ...task,
                dueDate: task.dueDate ? new Date(task.dueDate.replace(/-/g, '/')) : undefined,
            })) as Task[];

            setTasks(updatedTasksWithDates);

            const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: result.response };
            setMessages(prev => [...prev, assistantMessage]);

        } catch (error) {
            console.error("Assistant flow failed:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Sorry, I encountered an error. Please try again."
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!isInitialized) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-4">
            <Card className="w-full max-w-3xl h-full flex flex-col shadow-2xl">
                <CardHeader className="border-b">
                    <div className="flex items-center gap-3">
                        <Bot className="h-6 w-6 text-primary" />
                        <div>
                            <h2 className="text-lg font-semibold">AI Assistant</h2>
                            <p className="text-sm text-muted-foreground">Ask me to manage your tasks.</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden">
                    <ScrollArea ref={scrollAreaRef} className="h-full">
                        <div className="p-6 space-y-6">
                            {messages.length === 0 ? (
                                <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-4">
                                     <Sparkles className="h-16 w-16 text-muted-foreground/20" />
                                    <h3 className="text-xl font-medium">Talk to your Assistant</h3>
                                    <p className="max-w-sm">
                                        You can say things like: <br />
                                        <em className="text-foreground">"What are my high priority tasks?"</em> or <em className="text-foreground">"Create a task to finish the report by Friday"</em>.
                                    </p>
                                </div>
                            ) : (
                                messages.map((message) => (
                                    <div key={message.id} className={cn("flex items-start gap-4", message.role === 'user' ? 'justify-end' : 'justify-start')}>
                                        {message.role === 'assistant' && (
                                            <Avatar className="h-9 w-9 border">
                                                <AvatarFallback><Bot /></AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div className={cn(
                                            "max-w-[75%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap",
                                            message.role === 'user'
                                                ? "bg-primary text-primary-foreground rounded-br-none"
                                                : "bg-muted rounded-bl-none"
                                        )}>
                                            {message.content}
                                        </div>
                                        {message.role === 'user' && (
                                            <Avatar className="h-9 w-9 border">
                                                <AvatarFallback><User /></AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                ))
                            )}
                             {isLoading && (
                                <div className="flex items-start gap-4 justify-start">
                                     <Avatar className="h-9 w-9 border">
                                        <AvatarFallback><Bot /></AvatarFallback>
                                    </Avatar>
                                    <div className="bg-muted rounded-2xl px-4 py-3 rounded-bl-none flex items-center">
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
                <CardFooter className="p-4 border-t">
                    <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="e.g., Mark 'design landing page' as done..."
                            disabled={isLoading}
                        />
                        <Button type="submit" disabled={isLoading || !input.trim()}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            <span className="sr-only">Send</span>
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
}
