import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { 
    KanbanSquare, 
    BrainCircuit, 
    Wand2, 
    Sparkles, 
    LayoutDashboard, 
    Calendar, 
    Bell, 
    Search, 
    Volume2,
    Palette,
    MousePointerClick,
    Eye
} from 'lucide-react';

const FeatureItem = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="flex items-start gap-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
        </div>
        <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    </div>
);


export default function AboutPage() {
    return (
        <div className="container mx-auto max-w-5xl p-4 md:p-8 space-y-8">
            <header className="text-center">
                <h1 className="text-4xl font-bold tracking-tight">Welcome to TaskFlow!</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Your AI-powered command center for turning ideas into reality. Here’s a guide to all the features designed to boost your productivity.
                </p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                        <KanbanSquare className="h-7 w-7 text-primary" />
                        The Kanban Board
                    </CardTitle>
                    <CardDescription>The heart of your workflow, designed for clarity and control.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6 text-sm">
                   <FeatureItem 
                        icon={<MousePointerClick className="h-5 w-5" />}
                        title="Drag & Drop"
                        description="Intuitively move tasks between 'To Do', 'In Progress', and 'Done' columns to reflect their current status."
                   />
                   <FeatureItem 
                        icon={<Search className="h-5 w-5" />}
                        title="Filter & Search"
                        description="Quickly find any task using the search bar or advanced filters for priority and due dates."
                   />
                   <FeatureItem 
                        icon={<Eye className="h-5 w-5" />}
                        title="Compact View"
                        description="Toggle the compact view for a high-level overview of all your tasks at a glance."
                   />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                        <BrainCircuit className="h-7 w-7 text-primary" />
                        AI-Powered Productivity
                    </CardTitle>
                    <CardDescription>Leverage the power of generative AI to work smarter, not harder. Click each feature to learn more.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="smart-sort">
                            <AccordionTrigger>
                                <div className="flex items-center gap-3 font-semibold text-left">
                                    <BrainCircuit className="h-5 w-5 text-primary" />
                                    Smart Sort
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                Feeling overwhelmed? Let AI analyze your tasks and re-prioritize them based on urgency and importance. Find it on the Board page.
                            </AccordionContent>
                        </AccordionItem>
                         <AccordionItem value="smart-create">
                            <AccordionTrigger>
                                <div className="flex items-center gap-3 font-semibold text-left">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                    Smart Create
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                Start with just a title, and AI will generate a full description, suggest a priority, break it down into subtasks, and even create a relevant cover image for you. Use the "AI Smart Create" button in the New Task dialog.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="quick-add">
                            <AccordionTrigger>
                                <div className="flex items-center gap-3 font-semibold text-left">
                                    <Wand2 className="h-5 w-5 text-primary" />
                                    Quick Add with Natural Language
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                Use the <Sparkles className="inline-block h-4 w-4" /> popover in the header to create tasks using plain English like "Fix login bug due tomorrow high priority". AI will parse it into a structured task.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="ai-content">
                            <AccordionTrigger>
                                <div className="flex items-center gap-3 font-semibold text-left">
                                    <Palette className="h-5 w-5 text-primary" />
                                    AI Content Generation
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                Inside the task dialogs, use the "Generate with AI" and "Suggest with AI" buttons to create task descriptions, cover images, and subtasks on demand.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="ai-insights">
                            <AccordionTrigger>
                                <div className="flex items-center gap-3 font-semibold text-left">
                                    <LayoutDashboard className="h-5 w-5 text-primary" />
                                     AI Insights & Audio Summary
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                Visit the Dashboard to get a motivational summary of your progress. You can even listen to it by clicking the <Volume2 className="inline-block h-4 w-4" /> icon!
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-2xl">
                           <Eye className="h-7 w-7 text-primary" />
                            Application Views
                        </CardTitle>
                        <CardDescription>Visualize your work from different angles.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <FeatureItem 
                            icon={<LayoutDashboard className="h-5 w-5" />}
                            title="Dashboard"
                            description="Get a high-level overview of your productivity with charts, stats, and task lists."
                        />
                        <FeatureItem 
                            icon={<Calendar className="h-5 w-5" />}
                            title="Calendar"
                            description="See all your tasks with due dates in a full-page calendar view."
                        />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-2xl">
                           <Sparkles className="h-7 w-7 text-primary" />
                            UX Enhancements
                        </CardTitle>
                        <CardDescription>Features designed for a seamless experience.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <FeatureItem 
                            icon={<Search className="h-5 w-5" />}
                            title="Command Palette"
                            description="Press <Badge variant='secondary'>⌘K</Badge> or <Badge variant='secondary'>Ctrl+K</Badge> to instantly search for and navigate to any task."
                        />
                        <FeatureItem 
                            icon={<Bell className="h-5 w-5" />}
                            title="Notifications"
                            description="Stay updated with a real-time activity feed of all your actions, accessible via the bell icon."
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
