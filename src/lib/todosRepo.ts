import { getSql } from "@/lib/db";
import type { NewTodoInput, Priority, Todo } from "@/lib/todoTypes";

type Row = {
  id: string;
  text: string;
  completed: boolean;
  created_at: string | number;
  priority: Priority;
  due_date: string | null;
  due_time: string | null;
};

function toTodo(r: Row): Todo {
  return {
    id: r.id,
    text: r.text,
    completed: r.completed,
    createdAt: Number(r.created_at),
    priority: r.priority,
    dueDate: r.due_date,
    dueTime: r.due_date ? r.due_time : null,
  };
}

export async function listTodos(): Promise<Todo[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, text, completed, created_at, priority, due_date, due_time
    FROM todos
    ORDER BY created_at DESC
  `) as Row[];
  return rows.map(toTodo);
}

export async function createTodo(input: NewTodoInput): Promise<Todo> {
  const sql = getSql();
  const dueDate = input.dueDate || null;
  const dueTime = dueDate ? input.dueTime || null : null;
  const rows = (await sql`
    INSERT INTO todos (text, completed, created_at, priority, due_date, due_time)
    VALUES (${input.text}, false, ${Date.now()}, ${input.priority}, ${dueDate}, ${dueTime})
    RETURNING id, text, completed, created_at, priority, due_date, due_time
  `) as Row[];
  return toTodo(rows[0]);
}

/** 편집 저장: 편집 가능한 필드(text, priority, 기한)를 통째로 갱신한다. */
export async function editTodo(
  id: string,
  fields: { text: string; priority: Priority; dueDate: string | null; dueTime: string | null },
): Promise<Todo | null> {
  const sql = getSql();
  const dueDate = fields.dueDate || null;
  const dueTime = dueDate ? fields.dueTime || null : null;
  const rows = (await sql`
    UPDATE todos
    SET text = ${fields.text}, priority = ${fields.priority},
        due_date = ${dueDate}, due_time = ${dueTime}
    WHERE id = ${id}
    RETURNING id, text, completed, created_at, priority, due_date, due_time
  `) as Row[];
  return rows[0] ? toTodo(rows[0]) : null;
}

export async function setCompleted(
  id: string,
  completed: boolean,
): Promise<Todo | null> {
  const sql = getSql();
  const rows = (await sql`
    UPDATE todos SET completed = ${completed}
    WHERE id = ${id}
    RETURNING id, text, completed, created_at, priority, due_date, due_time
  `) as Row[];
  return rows[0] ? toTodo(rows[0]) : null;
}

export async function deleteTodo(id: string): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM todos WHERE id = ${id}`;
}

export async function clearCompleted(): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM todos WHERE completed = true`;
}
