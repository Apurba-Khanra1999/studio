import { config } from 'dotenv';
config();

import '@/ai/flows/generate-task-description.ts';
import '@/ai/flows/determine-task-priority.ts';