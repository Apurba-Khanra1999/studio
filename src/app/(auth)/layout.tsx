import Image from 'next/image';
import * as React from 'react';
import { KanbanSquare } from 'lucide-react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
            <div className="relative flex items-center justify-center py-12 lg:py-0">
                 <div className="absolute left-4 top-4 lg:left-8 lg:top-8 flex items-center gap-2 text-lg font-semibold">
                    <KanbanSquare className="h-6 w-6" />
                    <span>TaskFlow</span>
                </div>
                {children}
            </div>
            <div className="hidden bg-muted lg:block relative">
                <Image
                    src="https://placehold.co/1920x1080.png"
                    alt="A modern office space with large windows and plants"
                    width="1920"
                    height="1080"
                    className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                    data-ai-hint="modern workspace"
                />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                 <div className="absolute bottom-0 p-10 text-white">
                    <h2 className="text-3xl font-bold">Manage your tasks effortlessly.</h2>
                    <p className="mt-2 text-lg text-white/80">"The key is not to prioritize what's on your schedule, but to schedule your priorities."</p>
                    <p className="mt-4 font-semibold">- Stephen Covey</p>
                </div>
            </div>
        </div>
    );
}
