import Image from 'next/image';
import * as React from 'react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
            <div className="flex items-center justify-center py-12 lg:py-0">
                {children}
            </div>
            <div className="hidden bg-muted lg:block">
                <Image
                    src="https://placehold.co/1920x1080.png"
                    alt="A modern office space with large windows and plants"
                    width="1920"
                    height="1080"
                    className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                    data-ai-hint="office workspace"
                />
            </div>
        </div>
    );
}
