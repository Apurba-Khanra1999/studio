
'use server';
/**
 * @fileOverview Generates a complete task object from just a title using AI.
 *
 * - generateFullTaskFromTitle - A function that fleshes out a task.
 * - GenerateFullTaskFromTitleFlowInput - The top-level input for the flow, including the API key.
 * - GenerateFullTaskFromTitleOutput - The return type for the function.
 */

import { ai as baseAi } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { genkit, z } from 'genkit';

// Schema for the text-based details of the task.
const TaskDetailsSchema = z.object({
  description: z.string().describe('The AI-generated detailed description of the task.'),
  priority: z.enum(['High', 'Medium', 'Low']).describe('The AI-determined priority of the task.'),
  subtasks: z.array(z.string()).describe('A list of short, actionable AI-generated subtask descriptions.'),
});

const GenerateFullTaskFromTitleInputSchema = z.object({
  title: z.string().describe('The title of the task.'),
});

export const GenerateFullTaskFromTitleFlowInputSchema = z.object({
    apiKey: z.string(),
    input: GenerateFullTaskFromTitleInputSchema,
});
export type GenerateFullTaskFromTitleFlowInput = z.infer<typeof GenerateFullTaskFromTitleFlowInputSchema>;


// The final output schema includes the text details and the generated image URL.
const GenerateFullTaskFromTitleOutputSchema = TaskDetailsSchema.extend({
    imageUrl: z.string().describe("The generated image as a data URI. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateFullTaskFromTitleOutput = z.infer<typeof GenerateFullTaskFromTitleOutputSchema>;

// Prompt to generate the description, priority, and subtasks.
const textDetailsPrompt = baseAi.definePrompt({
    name: 'generateTaskDetailsPrompt',
    input: {schema: GenerateFullTaskFromTitleInputSchema},
    output: {schema: TaskDetailsSchema},
    prompt: `You are an expert project manager. Your goal is to take a simple task title and flesh it out into a detailed, actionable task.
    Based on the provided title, generate a detailed description, determine an appropriate priority (High, Medium, or Low), and break it down into a list of 2-4 smaller, actionable subtasks.

    Task Title: {{{title}}}
    `,
});

const generateFullTaskFromTitleFlow = baseAi.defineFlow(
    {
        name: 'generateFullTaskFromTitleFlow',
        inputSchema: GenerateFullTaskFromTitleInputSchema,
        outputSchema: GenerateFullTaskFromTitleOutputSchema,
    },
    async ({ title }, streamingCallback, context) => {
        const ai = context.plugins.googleai!;
        
        // Step 1: Start generating text details (description, priority, subtasks).
        const textDetailsPromise = ai.prompt(textDetailsPrompt, { title });

        // Step 2: Start generating the image in parallel.
        const imagePromise = ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: `Generate a clean, modern, and professional image that visually represents the following task: "${title}". The image should be suitable for a project management application. Avoid text and logos.`,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });

        // Await both promises to complete.
        const [{ output: textOutput }, { media }] = await Promise.all([textDetailsPromise, imagePromise]);
        
        if (!textOutput) {
            throw new Error('Failed to generate task details.');
        }
        if (!media) {
            throw new Error('No image was generated.');
        }

        // Combine the results into a single object.
        return {
            description: textOutput.description,
            priority: textOutput.priority,
            subtasks: textOutput.subtasks,
            imageUrl: media.url,
        };
    }
);


export async function generateFullTaskFromTitle(flowInput: GenerateFullTaskFromTitleFlowInput): Promise<GenerateFullTaskFromTitleOutput> {
  const { apiKey, input } = flowInput;
  
  const ai = genkit({
    plugins: [googleAI({ apiKey })],
  });

  return ai.run(generateFullTaskFromTitleFlow, input);
}
