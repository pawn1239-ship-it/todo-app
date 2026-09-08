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

/*
 * 모든 쿼리는 ownerId로 범위를 좁힌다. 수정·삭제까지 owner_id를 조건에 넣는
 * 이유는, id(uuid)만 알면 남의 항목을 건드릴 수 있게 되기 때문이다.
 * 남의 항목을 지목하면 0행이 갱신되어 null이 나가고 호출부는 404로 처리한다.
 */

export async function listTodos(ownerId: string): Promise<Todo[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, text, completed, created_at, priority, due_date, due_time
    FROM todos
    WHERE owner_id = ${ownerId}
    ORDER BY created_at DESC
  `) as Row[];
  return rows.map(toTodo);
}

export async function createTodo(
  ownerId: string,
  input: NewTodoInput,
): Promise<Todo> {
  const sql = getSql();
  const dueDate = input.dueDate || null;
  const dueTime = dueDate ? input.dueTime || null : null;
  const rows = (await sql`
    INSERT INTO todos (owner_id, text, completed, created_at, priority, due_date, due_time)
    VALUES (${ownerId}, ${input.text}, false, ${Date.now()}, ${input.priority}, ${dueDate}, ${dueTime})
    RETURNING id, text, completed, created_at, priority, due_date, due_time
  `) as Row[];
  return toTodo(rows[0]);
}

/** 편집 저장: 편집 가능한 필드(text, priority, 기한)를 통째로 갱신한다. */
export async function editTodo(
  ownerId: string,
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
    WHERE id = ${id} AND owner_id = ${ownerId}
    RETURNING id, text, completed, created_at, priority, due_date, due_time
  `) as Row[];
  return rows[0] ? toTodo(rows[0]) : null;
}

export async function setCompleted(
  ownerId: string,
  id: string,
  completed: boolean,
): Promise<Todo | null> {
  const sql = getSql();
  const rows = (await sql`
    UPDATE todos SET completed = ${completed}
    WHERE id = ${id} AND owner_id = ${ownerId}
    RETURNING id, text, completed, created_at, priority, due_date, due_time
  `) as Row[];
  return rows[0] ? toTodo(rows[0]) : null;
}

export async function deleteTodo(ownerId: string, id: string): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM todos WHERE id = ${id} AND owner_id = ${ownerId}`;
}

export async function clearCompleted(ownerId: string): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM todos WHERE completed = true AND owner_id = ${ownerId}`;
}
