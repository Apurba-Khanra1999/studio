
"use client";

import React, { useState, useRef, useCallback } from 'react';
import { useNotifications } from '@/hooks/use-notifications';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { BellRing, CheckCheck, Loader2 } from 'lucide-react';
import type { Notification } from '@/lib/types';

const NOTIFICATIONS_PER_PAGE = 15;

const NotificationItem = ({ notification }: { notification: Notification }) => (
    <div className={cn(
        "flex items-start gap-4 p-4 transition-colors hover:bg-muted/50",
        !notification.read && "bg-primary/5"
    )}>
        <div className="mt-1">
            <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center", 
                !notification.read ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
                <BellRing className="h-4 w-4" />
            </div>
        </div>
        <div className="flex-1">
            <p className="leading-snug text-sm">{notification.message}</p>
            <p className="text-xs text-muted-foreground mt-1.5">
                {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
            </p>
        </div>
    </div>
);

export default function NotificationsPage() {
    const { notifications, isInitialized } = useNotifications();
    const [visibleCount, setVisibleCount] = useState(NOTIFICATIONS_PER_PAGE);
    const [isLoading, setIsLoading] = useState(false);
    const observer = useRef<IntersectionObserver>();

    const lastNotificationElementRef = useCallback((node: any) => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && visibleCount < notifications.length) {
                setIsLoading(true);
                setTimeout(() => {
                    setVisibleCount(prev => prev + NOTIFICATIONS_PER_PAGE);
                    setIsLoading(false);
                }, 500); // Add a small delay to simulate loading
            }
        });

        if (node) observer.current.observe(node);
    }, [isLoading, notifications.length, visibleCount]);

    const visibleNotifications = notifications.slice(0, visibleCount);

    if (!isInitialized) {
        return (
            <div className="container mx-auto max-w-4xl p-4 md:p-6 space-y-4">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-5 w-1/2 mb-4" />
                <div className="border rounded-lg overflow-hidden">
                    <div className="divide-y">
                        {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-4xl p-4 md:p-6">
            <header className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                <p className="text-muted-foreground">All your recent updates in one place.</p>
            </header>
            
            <div className="border rounded-lg overflow-hidden">
                {notifications.length > 0 ? (
                    <div className="divide-y">
                        {visibleNotifications.map((notif, index) => (
                            <div key={notif.id} ref={visibleNotifications.length === index + 1 ? lastNotificationElementRef : null}>
                                <NotificationItem notification={notif} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-16 h-full">
                        <CheckCheck className="h-12 w-12 mb-4 text-muted-foreground/30" />
                        <h3 className="text-lg font-medium">All caught up!</h3>
                        <p className="text-sm">You have no notifications.</p>
                    </div>
                )}
            </div>

            {isLoading && (
                <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            )}
        </div>
    );
}
