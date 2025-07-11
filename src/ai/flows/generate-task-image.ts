
'use server';
/**
 * @fileOverview Generates an image for a task based on its title.
 *
 * - generateTaskImage - A function that generates an image for a task.
 * - GenerateTaskImageFlowInput - The top-level input for the flow, including the API key.
 * - GenerateTaskImageOutput - The return type for the function.
 */

import { ai as baseAi } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { genkit, z } from 'genkit';

const GenerateTaskImageInputSchema = z.object({
  title: z.string().describe('The title of the task.'),
});

export const GenerateTaskImageFlowInputSchema = z.object({
    apiKey: z.string(),
    input: GenerateTaskImageInputSchema,
});
export type GenerateTaskImageFlowInput = z.infer<typeof GenerateTaskImageFlowInputSchema>;


const GenerateTaskImageOutputSchema = z.object({
    imageUrl: z.string().describe("The generated image as a data URI. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateTaskImageOutput = z.infer<typeof GenerateTaskImageOutputSchema>;

const generateTaskImageFlow = baseAi.defineFlow(
    {
        name: 'generateTaskImageFlow',
        inputSchema: GenerateTaskImageInputSchema,
        outputSchema: GenerateTaskImageOutputSchema,
    },
    async ({ title }, streamingCallback, context) => {
        const ai = context.plugins.googleai!;
        
        const { media } = await ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: `Generate a clean, modern, and professional image that visually represents the following task: "${title}". The image should be suitable for a project management application. Avoid text and logos.`,
            config: {
              responseModalities: ['TEXT', 'IMAGE'],
            },
        });
        
        if (!media) {
          throw new Error('No image was generated.');
        }
    
        return {
            imageUrl: media.url,
        };
    }
);


export async function generateTaskImage(flowInput: GenerateTaskImageFlowInput): Promise<GenerateTaskImageOutput> {
  const { apiKey, input } = flowInput;
  
  const ai = genkit({
    plugins: [googleAI({ apiKey })],
  });

  return ai.run(generateTaskImageFlow, input);
}
