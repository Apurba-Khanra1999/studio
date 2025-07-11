
'use server';

/**
 * @fileOverview Generates a list of subtasks for a given task using AI.
 *
 * - generateSubtasks - A function that generates a list of subtasks.
 * - GenerateSubtasksFlowInput - The top-level input for the flow, including the API key.
 * - GenerateSubtasksOutput - The return type for the generateSubtasks function.
 */

import { configureGenkit } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateSubtasksInputSchema = z.object({
  title: z.string().describe('The title of the main task.'),
  description: z.string().describe('The description of the main task.'),
});

export const GenerateSubtasksFlowInputSchema = z.object({
    apiKey: z.string(),
    input: GenerateSubtasksInputSchema,
});
export type GenerateSubtasksFlowInput = z.infer<typeof GenerateSubtasksFlowInputSchema>;


const GenerateSubtasksOutputSchema = z.object({
  subtasks: z.array(z.string()).describe('A list of short, actionable subtask descriptions.'),
});
export type GenerateSubtasksOutput = z.infer<typeof GenerateSubtasksOutputSchema>;

export async function generateSubtasks(
  flowInput: GenerateSubtasksFlowInput
): Promise<GenerateSubtasksOutput> {
  const { apiKey, input } = flowInput;
  const ai = configureGenkit(apiKey);

  const prompt = ai.definePrompt({
    name: 'generateSubtasksPrompt',
    model: 'googleai/gemini-2.0-flash',
    input: {schema: GenerateSubtasksInputSchema},
    output: {schema: GenerateSubtasksOutputSchema},
    prompt: `You are an expert project manager. Based on the task title and description, break it down into a list of smaller, actionable subtasks. Each subtask should be a short phrase.

    Task Title: {{{title}}}
    Task Description: {{{description}}}

    Generate a list of subtasks. If the description is brief, create general subtasks appropriate for the title.`,
  });

  const {output} = await prompt(input);
  return output!;
}
