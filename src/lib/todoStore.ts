import type {
  NewTodoInput,
  Priority,
  Todo,
  TodoPatch,
} from "@/lib/todoTypes";

export type { NewTodoInput, Priority, Todo, TodoPatch };

type Listener = () => void;

// 서버 렌더링용 안정적인 빈 스냅샷 (매번 새 배열을 만들면 무한 루프)
const EMPTY: Todo[] = [];

let todos: Todo[] = EMPTY;
let started = false;
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener();
}

function setTodos(next: Todo[]) {
  todos = next;
  emit();
}

async function apiList(): Promise<Todo[]> {
  const res = await fetch("/api/todos", { cache: "no-store" });
  if (!res.ok) throw new Error(`목록 조회 실패: ${res.status}`);
  return res.json();
}

/** 서버 상태를 다시 읽어와 로컬 스냅샷을 동기화한다. */
async function refresh() {
  try {
    setTodos(await apiList());
  } catch (err) {
    console.error(err);
  }
}

// 클라이언트에서 최초 구독 시 1회만 서버 데이터를 불러온다.
function ensureStarted() {
  if (!started && typeof window !== "undefined") {
    started = true;
    void refresh();
  }
}

export const todoStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    ensureStarted();
    return () => listeners.delete(listener);
  },
  getSnapshot(): Todo[] {
    ensureStarted();
    return todos;
  },
  getServerSnapshot(): Todo[] {
    return EMPTY;
  },

  async add({ text, priority, dueDate, dueTime }: NewTodoInput) {
    const optimistic: Todo = {
      id: `temp-${crypto.randomUUID()}`,
      text,
      completed: false,
      createdAt: Date.now(),
      priority,
      dueDate: dueDate || null,
      dueTime: dueDate ? dueTime : null,
    };
    setTodos([optimistic, ...todos]);
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, priority, dueDate, dueTime }),
      });
      if (!res.ok) throw new Error(`추가 실패: ${res.status}`);
      const saved: Todo = await res.json();
      setTodos(todos.map((t) => (t.id === optimistic.id ? saved : t)));
    } catch (err) {
      console.error(err);
      await refresh();
    }
  },

  async toggle(id: string) {
    const target = todos.find((t) => t.id === id);
    if (!target) return;
    const completed = !target.completed;
    setTodos(todos.map((t) => (t.id === id ? { ...t, completed } : t)));
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
      if (!res.ok) throw new Error(`상태 변경 실패: ${res.status}`);
    } catch (err) {
      console.error(err);
      await refresh();
    }
  },

  async remove(id: string) {
    const prev = todos;
    setTodos(todos.filter((t) => t.id !== id));
    try {
      const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`삭제 실패: ${res.status}`);
    } catch (err) {
      console.error(err);
      setTodos(prev);
    }
  },

  async update(id: string, patch: TodoPatch) {
    const prev = todos;
    setTodos(todos.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error(`수정 실패: ${res.status}`);
      const saved: Todo = await res.json();
      setTodos(todos.map((t) => (t.id === id ? saved : t)));
    } catch (err) {
      console.error(err);
      setTodos(prev);
    }
  },

  async clearCompleted() {
    const prev = todos;
    setTodos(todos.filter((t) => !t.completed));
    try {
      const res = await fetch("/api/todos", { method: "DELETE" });
      if (!res.ok) throw new Error(`완료 항목 삭제 실패: ${res.status}`);
    } catch (err) {
      console.error(err);
      setTodos(prev);
    }
  },
};
