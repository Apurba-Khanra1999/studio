
'use server';

/**
 * @fileOverview Generates a brief, insightful summary of the user's tasks.
 *
 * - generateDashboardSummary - A function that creates a motivational summary.
 * - GenerateDashboardSummaryFlowInput - The top-level input for the flow, including the API key.
 * - GenerateDashboardSummaryOutput - The return type for the function.
 */

import { configureGenkit } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateDashboardSummaryInputSchema = z.object({
  totalTasks: z.number().describe('The total number of tasks.'),
  completedTasks: z.number().describe('The number of completed tasks.'),
  overdueTasks: z.number().describe('The number of tasks that are past their due date.'),
  upcomingTasks: z.number().describe('The number of tasks due in the next 7 days.'),
});

export const GenerateDashboardSummaryFlowInputSchema = z.object({
    apiKey: z.string(),
    input: GenerateDashboardSummaryInputSchema,
});
export type GenerateDashboardSummaryFlowInput = z.infer<typeof GenerateDashboardSummaryFlowInputSchema>;


const GenerateDashboardSummaryOutputSchema = z.object({
  summary: z.string().describe('A short, insightful, and motivational summary for the user.'),
});
export type GenerateDashboardSummaryOutput = z.infer<typeof GenerateDashboardSummaryOutputSchema>;

export async function generateDashboardSummary(
  flowInput: GenerateDashboardSummaryFlowInput
): Promise<GenerateDashboardSummaryOutput> {
  const { apiKey, input } = flowInput;
  const ai = configureGenkit(apiKey);

  // If there are no tasks, return a default message without calling the AI.
  if (input.totalTasks === 0) {
    return { summary: "No tasks yet! Add a new task to get started and see your progress here." };
  }

  const prompt = ai.definePrompt({
    name: 'generateDashboardSummaryPrompt',
    model: 'googleai/gemini-2.0-flash',
    input: {schema: GenerateDashboardSummaryInputSchema},
    output: {schema: GenerateDashboardSummaryOutputSchema},
    prompt: `You are a friendly and encouraging productivity assistant. Based on the following task statistics, write a short, insightful, and motivational summary for the user.

Your tone should be positive and encouraging, even when mentioning overdue tasks.
Keep the summary to 2-3 sentences.

Statistics:
- Total Tasks: {{{totalTasks}}}
- Completed Tasks: {{{completedTasks}}}
- Overdue Tasks: {{{overdueTasks}}}
- Upcoming Tasks: {{{upcomingTasks}}}

Example: "You're making great progress with {{{completedTasks}}} tasks done! You have {{{upcomingTasks}}} tasks coming up. Try to tackle the {{{overdueTasks}}} overdue tasks first to clear your plate. Keep up the great work!"
`,
  });

  const {output} = await prompt(input);
  return output!;
}
