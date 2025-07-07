'use server';
/**
 * @fileOverview A conversational AI assistant for managing tasks.
 *
 * - runAssistant - A function that processes a user's query about tasks.
 * - AssistantInput - The input type for the runAssistant function.
 * - AssistantOutput - The return type for the runAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {generateId} from '@/hooks/use-tasks';

// Zod schema for a Subtask
const SubtaskSchema = z.object({
  id: z.string(),
  text: z.string(),
  completed: z.boolean(),
});

// Zod schema for a Task
const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  priority: z.enum(['Low', 'Medium', 'High']),
  status: z.enum(['To Do', 'In Progress', 'Done']),
  dueDate: z.string().optional().describe("The due date in 'YYYY-MM-DD' format."),
  subtasks: z.array(SubtaskSchema),
  imageUrl: z.string().optional(),
});

const AssistantInputSchema = z.object({
  query: z.string().describe('The user\'s request in natural language.'),
  tasks: z.array(TaskSchema).describe('The current list of all tasks.'),
});
export type AssistantInput = z.infer<typeof AssistantInputSchema>;

const AssistantOutputSchema = z.object({
  response: z.string().describe('The AI\'s conversational response.'),
  tasks: z.array(TaskSchema).describe('The final list of tasks after applying any changes.'),
});
export type AssistantOutput = z.infer<typeof AssistantOutputSchema>;

// Wrapper function to be called from the client
export async function runAssistant(input: AssistantInput): Promise<AssistantOutput> {
  return assistantFlow(input);
}

const listTasksTool = ai.defineTool(
  {
    name: 'listTasks',
    description: 'List tasks based on optional filters like status, priority, or a search query.',
    inputSchema: z.object({
      status: z.enum(['To Do', 'In Progress', 'Done']).optional(),
      priority: z.enum(['Low', 'Medium', 'High']).optional(),
      query: z.string().optional().describe('A keyword or phrase to search for in task titles and descriptions.'),
    }),
    outputSchema: z.array(z.object({
        id: z.string(),
        title: z.string(),
        status: z.enum(['To Do', 'In Progress', 'Done']),
        priority: z.enum(['Low', 'Medium', 'High']),
    })),
  },
  async () => {
    // This is a placeholder. The real implementation is provided in the flow.
    return [];
  }
);

const createTaskTool = ai.defineTool(
  {
    name: 'createTask',
    description: 'Create a new task with a title and other optional details.',
    inputSchema: z.object({
      title: z.string(),
      description: z.string().optional(),
      priority: z.enum(['Low', 'Medium', 'High']).optional(),
      status: z.enum(['To Do', 'In Progress', 'Done']).optional(),
    }),
    outputSchema: TaskSchema,
  },
  async (input) => {
    // This is a placeholder. The real implementation is provided in the flow.
    const newTask = {
        id: `task-${generateId()}`,
        title: input.title,
        description: input.description || '',
        priority: input.priority || 'Medium',
        status: input.status || 'To Do',
        subtasks: [],
    };
    return newTask;
  }
);

const updateTaskStatusTool = ai.defineTool(
  {
      name: 'updateTaskStatus',
      description: 'Update the status of an existing task by its title or ID. Prefer title if available.',
      inputSchema: z.object({
        taskTitle: z.string().optional().describe('The title of the task to update.'),
        taskId: z.string().optional().describe('The ID of the task to update.'),
        status: z.enum(['To Do', 'In Progress', 'Done']).describe('The new status for the task.'),
      }),
      outputSchema: z.string(),
  },
  async () => {
      // This is a placeholder. The real implementation is provided in the flow.
      return `Task status updated.`;
  }
);

const assistantFlow = ai.defineFlow(
  {
    name: 'assistantFlow',
    inputSchema: AssistantInputSchema,
    outputSchema: AssistantOutputSchema,
  },
  async ({ query, tasks }) => {
    // Create a mutable copy of tasks for this flow execution
    let currentTasks = [...tasks];

    const tools = {
      listTasks: {
          tool: listTasksTool,
          fn: async ({ status, priority, query: searchQuery }: z.infer<typeof listTasksTool.inputSchema>) => {
              let filteredTasks = [...currentTasks];
              if (status) {
                  filteredTasks = filteredTasks.filter(t => t.status === status);
              }
              if (priority) {
                  filteredTasks = filteredTasks.filter(t => t.priority === priority);
              }
              if (searchQuery) {
                  const lowerCaseQuery = searchQuery.toLowerCase();
                  filteredTasks = filteredTasks.filter(t => 
                      t.title.toLowerCase().includes(lowerCaseQuery) ||
                      (t.description && t.description.toLowerCase().includes(lowerCaseQuery))
                  );
              }
              // Return only essential info to avoid polluting the prompt with too much data.
              return filteredTasks.map(({id, title, status, priority}) => ({id, title, status, priority}));
          },
      },
      createTask: {
          tool: createTaskTool,
          fn: async ({ title, description, priority, status }: z.infer<typeof createTaskTool.inputSchema>) => {
              const newTask: z.infer<typeof TaskSchema> = {
                  id: `task-${generateId()}`,
                  title,
                  description: description || '',
                  priority: priority || 'Medium',
                  status: status || 'To Do',
                  subtasks: [],
              };
              currentTasks.push(newTask);
              return newTask;
          },
      },
      updateTaskStatus: {
          tool: updateTaskStatusTool,
          fn: async ({ taskId, taskTitle, status }: z.infer<typeof updateTaskStatusTool.inputSchema>) => {
              let taskIndex = -1;
              if (taskId) {
                taskIndex = currentTasks.findIndex(t => t.id === taskId);
              } else if (taskTitle) {
                taskIndex = currentTasks.findIndex(t => t.title.toLowerCase() === taskTitle.toLowerCase());
              }

              if (taskIndex !== -1) {
                  currentTasks[taskIndex].status = status;
                  return `Successfully updated task "${currentTasks[taskIndex].title}" to ${status}.`;
              }
              return `Error: Task with identifier "${taskId || taskTitle}" not found.`;
          },
      },
    };

    const {output} = await ai.generate({
        prompt: query,
        system: `You are a helpful and friendly task management assistant.
        - You can list, create, and update tasks for the user.
        - When listing tasks, provide a concise summary of the results.
        - When creating or updating a task, confirm the action you have taken.
        - If you need to identify a task to update, and multiple tasks match a title, ask the user for clarification.
        - The user's current tasks are provided in the context; use the provided tools to interact with them.`,
        tools: Object.values(tools).map(t => t.tool),
        toolImplementation: Object.fromEntries(Object.entries(tools).map(([k,v]) => [k,v.fn])),
    });

    return {
      response: output,
      tasks: currentTasks,
    };
  }
);
