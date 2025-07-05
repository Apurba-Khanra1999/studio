'use server';

/**
 * @fileOverview An AI agent for determining task priority based on task title and description.
 *
 * - determineTaskPriority - A function that determines the priority of a task.
 * - DetermineTaskPriorityInput - The input type for the determineTaskPriority function.
 * - DetermineTaskPriorityOutput - The return type for the determineTaskPriority function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetermineTaskPriorityInputSchema = z.object({
  title: z.string().describe('The title of the task.'),
  description: z.string().describe('The description of the task.'),
});
export type DetermineTaskPriorityInput = z.infer<typeof DetermineTaskPriorityInputSchema>;

const DetermineTaskPriorityOutputSchema = z.object({
  priority: z
    .enum(['High', 'Medium', 'Low'])
    .describe('The priority of the task, can be High, Medium, or Low.'),
});
export type DetermineTaskPriorityOutput = z.infer<typeof DetermineTaskPriorityOutputSchema>;

export async function determineTaskPriority(
  input: DetermineTaskPriorityInput
): Promise<DetermineTaskPriorityOutput> {
  return determineTaskPriorityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'determineTaskPriorityPrompt',
  input: {schema: DetermineTaskPriorityInputSchema},
  output: {schema: DetermineTaskPriorityOutputSchema},
  prompt: `You are a task management expert. You will determine the priority of a task based on its title and description. The priority can be High, Medium, or Low. Return the priority.

If the description is short or missing, rely more heavily on the title to infer the priority. For example, a title like "Fix critical login bug" implies high priority.

Title: {{{title}}}
Description: {{{description}}}
`,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const determineTaskPriorityFlow = ai.defineFlow(
  {
    name: 'determineTaskPriorityFlow',
    inputSchema: DetermineTaskPriorityInputSchema,
    outputSchema: DetermineTaskPriorityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
