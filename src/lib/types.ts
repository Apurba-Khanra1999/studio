export type Priority = "Low" | "Medium" | "High";
export type Status = "To Do" | "In Progress" | "Done";

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  dueDate?: Date;
}
