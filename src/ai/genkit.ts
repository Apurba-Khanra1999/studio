
import { genkit, Genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// This is a global AI instance for cases where no API key is needed
// or for flows that do not need to be initialized with one.
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_API_KEY || 'mock-key-for-initialization',
    }),
  ],
});


// This function creates a new, configured Genkit instance on-demand with a specific API key.
// It is used by each flow to ensure that the user-specific key is used for every AI call.
export function configureGenkit(apiKey: string): Genkit {
    return genkit({
        plugins: [
            googleAI({ apiKey }),
        ],
    });
}
