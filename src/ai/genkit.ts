
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// This is a global AI instance for cases where no API key is needed
// or for flows that do not need to be initialized with one.
// We provide a mock key so that the prompts and flows can be defined
// without requiring a key at server startup.
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: 'mock-api-key',
    }),
  ],
});
