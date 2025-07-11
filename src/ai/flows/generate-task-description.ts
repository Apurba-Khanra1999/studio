
'use server';
/**
 * @fileOverview Generates a task description from a title using AI.
 *
 * - generateTaskDescription - A function that creates a task description.
 * - GenerateTaskDescriptionFlowInput - The top-level input for the flow, including the API key.
 * - GenerateTaskDescriptionOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

const GenerateTaskDescriptionInputSchema = z.object({
  title: z.string().describe('The title of the task.'),
});

export const GenerateTaskDescriptionFlowInputSchema = z.object({
    apiKey: z.string(),
    input: GenerateTaskDescriptionInputSchema,
});
export type GenerateTaskDescriptionFlowInput = z.infer<typeof GenerateTaskDescriptionFlowInputSchema>;


const GenerateTaskDescriptionOutputSchema = z.object({
  description: z.string().describe('The AI-generated detailed description of the task.'),
});
export type GenerateTaskDescriptionOutput = z.infer<typeof GenerateTaskDescriptionOutputSchema>;


const prompt = ai.definePrompt({
    name: 'generateTaskDescriptionPrompt',
    model: 'googleai/gemini-2.0-flash',
    input: {schema: GenerateTaskDescriptionInputSchema},
    output: {schema: GenerateTaskDescriptionOutputSchema},
    prompt: `You are an expert project manager. Your goal is to take a task title and write a detailed, helpful description for it.
    The description should clarify the task's purpose and scope.

    Task Title: {{{title}}}
    `,
});

const generateTaskDescriptionFlow = ai.defineFlow(
    {
        name: 'generateTaskDescriptionFlow',
        inputSchema: GenerateTaskDescriptionInputSchema,
        outputSchema: GenerateTaskDescriptionOutputSchema,
    },
    async ({ title }) => {
        const {output} = await prompt({title});
        return output!;
    }
);

export async function generateTaskDescription(
  flowInput: GenerateTaskDescriptionFlowInput
): Promise<GenerateTaskDescriptionOutput> {
  const { apiKey, input } = flowInput;
  
  return generateTaskDescriptionFlow(input, {
    plugins: [googleAI({ apiKey })],
  });
}
