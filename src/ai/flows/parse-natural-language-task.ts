
'use server';
/**
 * @fileOverview Parses natural language text into a structured task object.
 *
 * - parseNaturalLanguageTask - A function that handles the parsing.
 * - ParseNaturalLanguageTaskFlowInput - The top-level input for the flow, including the API key.
 * - ParseNaturalLanguageTaskOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';
import { format } from 'date-fns';

const ParseNaturalLanguageTaskInputSchema = z.object({
  text: z.string().describe('The natural language text describing the task.'),
  currentDate: z.string().describe('The current date in YYYY-MM-DD format.'),
});

export const ParseNaturalLanguageTaskFlowInputSchema = z.object({
    apiKey: z.string(),
    input: z.object({ text: z.string() }),
});
export type ParseNaturalLanguageTaskFlowInput = z.infer<typeof ParseNaturalLanguageTaskFlowInputSchema>;


const ParseNaturalLanguageTaskOutputSchema = z.object({
  title: z.string().describe('The extracted title of the task.'),
  description: z.string().optional().describe('A detailed description if provided.'),
  priority: z.enum(['High', 'Medium', 'Low']).optional().describe('The extracted priority of the task.'),
  dueDate: z.string().optional().describe("The extracted due date in 'YYYY-MM-DD' format."),
});
export type ParseNaturalLanguageTaskOutput = z.infer<typeof ParseNaturalLanguageTaskOutputSchema>;


const prompt = ai.definePrompt({
    name: 'parseNaturalLanguageTaskPrompt',
    input: {schema: ParseNaturalLanguageTaskInputSchema},
    output: {schema: ParseNaturalLanguageTaskOutputSchema},
    prompt: `You are an intelligent task parsing assistant. Your job is to extract structured information from a user's text input to create a task.

Current Date: {{currentDate}}

Analyze the user's text and extract the following information:
- A concise title for the task.
- A detailed description, if one is provided.
- The priority (High, Medium, or Low). If not specified, you can infer it from keywords (e.g., 'urgent' implies High). If no inference can be made, leave it blank.
- The due date. If relative dates like "tomorrow", "next Friday", or "in 2 weeks" are used, convert them to a specific 'YYYY-MM-DD' format based on the current date.

User Input: "{{{text}}}"`,
});

const parseNaturalLanguageTaskFlow = ai.defineFlow(
    {
        name: 'parseNaturalLanguageTaskFlow',
        inputSchema: ParseNaturalLanguageTaskInputSchema,
        outputSchema: ParseNaturalLanguageTaskOutputSchema,
    },
    async (input) => {
        const {output} = await prompt(input);
        return output!;
    }
);


export async function parseNaturalLanguageTask(
  flowInput: ParseNaturalLanguageTaskFlowInput
): Promise<ParseNaturalLanguageTaskOutput> {
  const { apiKey, input } = flowInput;
  const currentDate = format(new Date(), 'yyyy-MM-dd');
  
  return parseNaturalLanguageTaskFlow({ text: input.text, currentDate }, {
    plugins: [googleAI({ apiKey })],
    models: [{
        model: 'gemini-2.0-flash',
    }]
  });
}
