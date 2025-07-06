'use server';
/**
 * @fileOverview Generates an image for a task based on its title.
 *
 * - generateTaskImage - A function that handles the image generation process.
 * - GenerateTaskImageInput - The input type for the generateTaskImage function.
 * - GenerateTaskImageOutput - The return type for the generateTaskImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTaskImageInputSchema = z.object({
  title: z.string().describe('The title of the task to generate an image for.'),
});
export type GenerateTaskImageInput = z.infer<typeof GenerateTaskImageInputSchema>;

const GenerateTaskImageOutputSchema = z.object({
  imageUrl: z
    .string()
    .describe(
      "The generated image as a data URI. Expected format: 'data:image/png;base64,<encoded_data>'."
    ),
});
export type GenerateTaskImageOutput = z.infer<typeof GenerateTaskImageOutputSchema>;

export async function generateTaskImage(input: GenerateTaskImageInput): Promise<GenerateTaskImageOutput> {
  return generateTaskImageFlow(input);
}

const generateTaskImageFlow = ai.defineFlow(
  {
    name: 'generateTaskImageFlow',
    inputSchema: GenerateTaskImageInputSchema,
    outputSchema: GenerateTaskImageOutputSchema,
  },
  async ({title}) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate an image that visually represents the following task: "${title}". The style should be clean, modern, and suitable for a project management application.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media) {
      throw new Error('No image was generated.');
    }

    return {imageUrl: media.url};
  }
);
