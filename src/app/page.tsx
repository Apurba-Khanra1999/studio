"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { KanbanSquare, BrainCircuit, Blocks, Sparkles, Move, Users, ShieldCheck } from 'lucide-react';

const LandingHeader = () => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
    <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
      <Link href="/" className="flex items-center gap-2 font-bold text-lg">
        <KanbanSquare className="h-6 w-6 text-primary" />
        <span>TaskFlow</span>
      </Link>
      <nav className="hidden md:flex gap-6 text-sm font-medium">
        <Link href="#features" className="text-muted-foreground hover:text-foreground">Features</Link>
        <Link href="#testimonials" className="text-muted-foreground hover:text-foreground">Testimonials</Link>
        <Link href="/about" className="text-muted-foreground hover:text-foreground">Documentation</Link>
      </nav>
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild>
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild>
          <Link href="/signup">Get Started</Link>
        </Button>
      </div>
    </div>
  </header>
);

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <Card className="text-center flex flex-col items-center p-4">
        <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                {icon}
            </div>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

const TestimonialCard = ({ name, role, text, avatarSrc }: { name: string, role: string, text: string, avatarSrc: string }) => (
    <Card className="p-6">
        <CardContent className="p-0">
            <blockquote className="text-muted-foreground">"{text}"</blockquote>
            <div className="mt-4 flex items-center gap-4">
                <Avatar>
                    <AvatarImage src={avatarSrc} alt={name} data-ai-hint="person portrait"/>
                    <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{name}</p>
                    <p className="text-sm text-muted-foreground">{role}</p>
                </div>
            </div>
        </CardContent>
    </Card>
);

const LandingFooter = () => (
    <footer className="bg-muted">
        <div className="container mx-auto px-4 md:px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 font-bold text-lg">
                    <KanbanSquare className="h-6 w-6 text-primary" />
                    <span>TaskFlow</span>
                </div>
                <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} TaskFlow. All rights reserved.</p>
                <div className="flex gap-4">
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link>
                </div>
            </div>
        </div>
    </footer>
);

export default function RootPage() {
  return (
    <div className="bg-background text-foreground">
      <LandingHeader />
      <main className="mt-16">
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="bg-primary text-primary-foreground inline-block rounded-full px-4 py-1 text-sm font-semibold mb-4">
                Supercharged with Generative AI
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
                Organize your work, finally.
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
                From chaotic to-do lists to streamlined workflows. TaskFlow is the AI-powered task manager that helps you focus on what truly matters.
            </p>
            <div className="flex justify-center gap-4">
                <Button size="lg" asChild>
                    <Link href="/signup">Get Started for Free</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                    <Link href="#features">Learn More</Link>
                </Button>
            </div>
          </div>
        </section>

        {/* Visual App Preview Section */}
        <section className="container mx-auto px-4 md:px-6 mb-20">
            <div className="relative rounded-xl shadow-2xl overflow-hidden border">
                <Image 
                    src="https://placehold.co/1200x700.png"
                    alt="TaskFlow application interface showing a Kanban board"
                    width={1200}
                    height={700}
                    className="w-full"
                    data-ai-hint="app interface"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold">Everything you need to be productive</h2>
                    <p className="max-w-xl mx-auto text-muted-foreground mt-4">
                        TaskFlow combines powerful features with a delightful user experience to keep you and your projects on track.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <FeatureCard 
                        icon={<Sparkles className="h-6 w-6" />}
                        title="AI Smart Assistant"
                        description="Generate tasks, descriptions, and subtasks from a single line of text. Let our AI handle the busywork so you can focus on execution."
                    />
                    <FeatureCard 
                        icon={<Move className="h-6 w-6" />}
                        title="Intuitive Kanban Board"
                        description="Visually organize your work with a simple drag-and-drop interface. Move tasks seamlessly between To Do, In Progress, and Done."
                    />
                    <FeatureCard 
                        icon={<BrainCircuit className="h-6 w-6" />}
                        title="Intelligent Prioritization"
                        description="Use 'Smart Sort' to let AI analyze and re-prioritize your tasks, ensuring you're always working on what's most important."
                    />
                     <FeatureCard 
                        icon={<Blocks className="h-6 w-6" />}
                        title="Detailed Task Management"
                        description="Add due dates, subtasks, cover images, and detailed descriptions to keep all your project information in one place."
                    />
                     <FeatureCard 
                        icon={<Users className="h-6 w-6" />}
                        title="Multiple Views"
                        description="Switch between Board, Dashboard, and Calendar views to get the perfect perspective on your workload and deadlines."
                    />
                     <FeatureCard 
                        icon={<ShieldCheck className="h-6 w-6" />}
                        title="Private & Secure"
                        description="Your data is your own. All tasks are stored securely in your browser's local storage and are never sent to the cloud."
                    />
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20">
            <div className="container mx-auto px-4 md:px-6">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold">Loved by users around the world</h2>
                    <p className="max-w-xl mx-auto text-muted-foreground mt-4">
                        Don't just take our word for it. Here's what our users are saying about TaskFlow.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <TestimonialCard 
                        name="Sarah Johnson"
                        role="Project Manager"
                        text="TaskFlow has revolutionized how our team handles projects. The AI features are a game-changer for productivity."
                        avatarSrc="https://placehold.co/100x100.png"
                    />
                    <TestimonialCard 
                        name="Michael Chen"
                        role="Freelance Developer"
                        text="As a solo developer, staying organized is key. TaskFlow's simple interface and powerful sorting helps me stay on top of everything."
                        avatarSrc="https://placehold.co/100x100.png"
                    />
                    <TestimonialCard 
                        name="Emily Rodriguez"
                        role="Startup Founder"
                        text="The visual Kanban board is exactly what my team needed. It’s intuitive, beautiful, and keeps everyone aligned."
                        avatarSrc="https://placehold.co/100x100.png"
                    />
                </div>
            </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-muted">
            <div className="container mx-auto px-4 md:px-6 text-center">
                 <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-6">
                    Ready to Boost Your Productivity?
                </h2>
                <p className="max-w-xl mx-auto text-lg text-muted-foreground mb-8">
                    Join thousands of users who are getting more done with less stress.
                </p>
                <Button size="lg" asChild>
                    <Link href="/signup">Start for Free Now</Link>
                </Button>
            </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
