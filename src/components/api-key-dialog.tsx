
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
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
import { useApiKey } from '@/hooks/use-api-key';
import { KeyRound, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const schema = z.object({
  apiKey: z.string().min(10, "Your API key seems too short. Please check it and try again."),
});
type FormValues = z.infer<typeof schema>;

interface ApiKeyDialogProps {
    isOpen: boolean;
}

export function ApiKeyDialog({ isOpen }: ApiKeyDialogProps) {
  const { setApiKey } = useApiKey();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      apiKey: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    setApiKey(data.apiKey);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => { /* Don't close on overlay click */ }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-6 w-6 text-primary" />
            Enter Your Gemini API Key
          </DialogTitle>
          <DialogDescription>
            To use the AI features of TaskFlow, you need to provide your own Google Gemini API key. Your key is stored securely in your browser's local storage and is never sent to our servers.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                        <FormLabel>Your API Key</FormLabel>
                        <FormControl>
                            <Input
                            type="password"
                            placeholder="AIzaSy..."
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                  )}
                />

                <p className="text-xs text-muted-foreground">
                    You can get your free API key from Google AI Studio.
                </p>

                <DialogFooter className="gap-2 sm:justify-between">
                    <Button variant="outline" asChild>
                        <Link href="https://aistudio.google.com/app/apikey" target="_blank">
                            Get an API Key
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                    <Button type="submit">Save and Continue</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
