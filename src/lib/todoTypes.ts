export type Priority = "high" | "medium" | "low";

export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  priority: Priority;
  /** "YYYY-MM-DD" 형식, 없으면 null */
  dueDate: string | null;
  /** "HH:mm" 형식, dueDate가 없으면 항상 null */
  dueTime: string | null;
};

export type NewTodoInput = {
  text: string;
  priority: Priority;
  dueDate: string | null;
  dueTime: string | null;
};

export type TodoPatch = Partial<
  Pick<Todo, "text" | "priority" | "dueDate" | "dueTime" | "completed">
>;
