"use client";

import { useMemo, useState, useSyncExternalStore, type FormEvent } from "react";
import Clock from "@/components/Clock";
import { todoStore, type Priority, type Todo } from "@/lib/todoStore";

type Filter = "all" | "active" | "completed";

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

const PRIORITY_META: Record<
  Priority,
  { label: string; badge: string; dot: string; ring: string }
> = {
  high: {
    label: "높음",
    badge:
      "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
    dot: "bg-rose-500",
    ring: "focus:ring-rose-400/40",
  },
  medium: {
    label: "보통",
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    dot: "bg-amber-500",
    ring: "focus:ring-amber-400/40",
  },
  low: {
    label: "낮음",
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
    dot: "bg-sky-500",
    ring: "focus:ring-sky-400/40",
  },
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function dueTimestamp(dueDate: string | null, dueTime: string | null): number {
  if (!dueDate) return Infinity;
  return new Date(`${dueDate}T${dueTime ?? "23:59"}`).getTime();
}

function formatDue(dueDate: string | null, dueTime: string | null): string | null {
  if (!dueDate) return null;
  const d = new Date(`${dueDate}T${dueTime ?? "00:00"}`);
  if (Number.isNaN(d.getTime())) return null;
  let label = `${d.getMonth() + 1}월 ${d.getDate()}일(${WEEKDAYS[d.getDay()]})`;
  if (dueTime) {
    const hours = d.getHours();
    const period = hours < 12 ? "오전" : "오후";
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;
    label += ` ${period} ${hour12}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  return label;
}

function isOverdue(todo: Todo): boolean {
  if (!todo.dueDate || todo.completed) return false;
  return dueTimestamp(todo.dueDate, todo.dueTime) < Date.now();
}

function compareTodos(a: Todo, b: Todo): number {
  const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
  if (priorityDiff !== 0) return priorityDiff;
  const dueDiff =
    dueTimestamp(a.dueDate, a.dueTime) - dueTimestamp(b.dueDate, b.dueTime);
  if (dueDiff !== 0) return dueDiff;
  return b.createdAt - a.createdAt;
}

const FIELD =
  "rounded-xl border border-black/[.08] bg-white/80 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none backdrop-blur transition focus:border-transparent focus:ring-2 focus:ring-indigo-400/50 placeholder:text-zinc-400 dark:border-white/[.12] dark:bg-white/[.06] dark:text-zinc-50";

export default function TodoApp() {
  const todos = useSyncExternalStore(
    todoStore.subscribe,
    todoStore.getSnapshot,
    todoStore.getServerSnapshot,
  );
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingPriority, setEditingPriority] = useState<Priority>("medium");
  const [editingDueDate, setEditingDueDate] = useState("");
  const [editingDueTime, setEditingDueTime] = useState("");

  const resetForm = () => {
    setInput("");
    setPriority("medium");
    setDueDate("");
    setDueTime("");
  };

  const addTodo = (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    todoStore.add({
      text,
      priority,
      dueDate: dueDate || null,
      dueTime: dueDate ? dueTime || null : null,
    });
    resetForm();
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditingText(todo.text);
    setEditingPriority(todo.priority);
    setEditingDueDate(todo.dueDate ?? "");
    setEditingDueTime(todo.dueTime ?? "");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText("");
    setEditingDueDate("");
    setEditingDueTime("");
  };

  const commitEditing = () => {
    const text = editingText.trim();
    if (editingId && text) {
      todoStore.update(editingId, {
        text,
        priority: editingPriority,
        dueDate: editingDueDate || null,
        dueTime: editingDueDate ? editingDueTime || null : null,
      });
    }
    cancelEditing();
  };

  const filteredTodos = useMemo(() => {
    const base =
      filter === "active"
        ? todos.filter((t) => !t.completed)
        : filter === "completed"
          ? todos.filter((t) => t.completed)
          : todos;
    return [...base].sort(compareTodos);
  }, [todos, filter]);

  const total = todos.length;
  const completedCount = useMemo(
    () => todos.filter((t) => t.completed).length,
    [todos],
  );
  const remainingCount = total - completedCount;
  const progress = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  return (
    <div className="relative z-10 w-full max-w-md">
      {/* 그라데이션 글로우 테두리 */}
      <div className="absolute -inset-[1px] rounded-[1.6rem] bg-gradient-to-br from-indigo-400 via-fuchsia-400 to-sky-400 opacity-60 blur-[2px] dark:opacity-40" />

      <div className="relative rounded-[1.55rem] border border-white/60 bg-white/90 p-6 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl dark:border-white/[.08] dark:bg-zinc-900/85">
        <header className="mb-5 text-center">
          <Clock />
          <h1 className="bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-sky-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent dark:from-indigo-400 dark:via-fuchsia-400 dark:to-sky-400">
            할 일 목록
          </h1>
          <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {total === 0
              ? "첫 번째 할 일을 추가해 보세요"
              : `${completedCount} / ${total} 완료 · ${remainingCount}개 남음`}
          </p>

          {/* 진행률 바 */}
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-black/[.06] dark:bg-white/[.08]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-sky-500 transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        <form onSubmit={addTodo} className="mb-5 flex flex-col gap-2.5">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="할 일을 입력하세요"
              className={`flex-1 ${FIELD}`}
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-fuchsia-500/40 hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              disabled={!input.trim()}
            >
              추가
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className={`text-xs ${FIELD} py-1.5`}
            >
              <option value="high">우선순위: 높음</option>
              <option value="medium">우선순위: 보통</option>
              <option value="low">우선순위: 낮음</option>
            </select>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={`text-xs ${FIELD} py-1.5`}
            />
            <input
              type="time"
              value={dueTime}
              disabled={!dueDate}
              onChange={(e) => setDueTime(e.target.value)}
              className={`text-xs ${FIELD} py-1.5 disabled:opacity-40`}
            />
          </div>
        </form>

        {/* 필터 세그먼트 */}
        <div className="mb-4 flex gap-1 rounded-xl bg-black/[.05] p-1 dark:bg-white/[.06]">
          {(
            [
              { key: "all", label: "전체" },
              { key: "active", label: "진행중" },
              { key: "completed", label: "완료" },
            ] as { key: Filter; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-all ${
                filter === key
                  ? "bg-white text-indigo-600 shadow-sm dark:bg-zinc-800 dark:text-indigo-300"
                  : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <ul className="flex flex-col gap-2">
          {filteredTodos.length === 0 && (
            <li className="rounded-xl border border-dashed border-black/[.1] py-10 text-center text-sm text-zinc-400 dark:border-white/[.12] dark:text-zinc-500">
              할 일이 없습니다.
            </li>
          )}
          {filteredTodos.map((todo) => {
            const dueLabel = formatDue(todo.dueDate, todo.dueTime);
            const overdue = isOverdue(todo);
            const meta = PRIORITY_META[todo.priority];

            return (
              <li
                key={todo.id}
                className={`todo-in group relative flex items-start gap-3 overflow-hidden rounded-xl border border-black/[.06] bg-white/75 px-3 py-2.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-300/60 hover:shadow-md dark:border-white/[.07] dark:bg-white/[.04] dark:hover:border-indigo-500/40 ${
                  todo.completed ? "opacity-70" : ""
                }`}
              >
                {/* 우선순위 색 스트립 */}
                <span
                  className={`absolute inset-y-0 left-0 w-1 ${meta.dot}`}
                  aria-hidden
                />

                <label className="relative mt-0.5 flex shrink-0 cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => todoStore.toggle(todo.id)}
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-zinc-300 transition-all checked:border-transparent checked:bg-gradient-to-br checked:from-indigo-500 checked:to-fuchsia-500 dark:border-zinc-600"
                  />
                  <svg
                    className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M2.5 6.5L5 9l4.5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </label>

                {editingId === todo.id ? (
                  <div className="flex flex-1 flex-col gap-2">
                    <input
                      autoFocus
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitEditing();
                        if (e.key === "Escape") cancelEditing();
                      }}
                      className={`w-full ${FIELD} py-1`}
                    />
                    <div className="flex flex-wrap gap-2">
                      <select
                        value={editingPriority}
                        onChange={(e) =>
                          setEditingPriority(e.target.value as Priority)
                        }
                        className={`text-xs ${FIELD} py-1`}
                      >
                        <option value="high">높음</option>
                        <option value="medium">보통</option>
                        <option value="low">낮음</option>
                      </select>
                      <input
                        type="date"
                        value={editingDueDate}
                        onChange={(e) => setEditingDueDate(e.target.value)}
                        className={`text-xs ${FIELD} py-1`}
                      />
                      <input
                        type="time"
                        value={editingDueTime}
                        disabled={!editingDueDate}
                        onChange={(e) => setEditingDueTime(e.target.value)}
                        className={`text-xs ${FIELD} py-1 disabled:opacity-40`}
                      />
                      <button
                        type="button"
                        onClick={commitEditing}
                        className="rounded-lg bg-gradient-to-br from-indigo-600 to-fuchsia-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition active:scale-95"
                      >
                        저장
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="rounded-lg border border-black/[.1] px-3 py-1 text-xs text-zinc-500 transition hover:bg-black/[.04] dark:border-white/[.15] dark:text-zinc-400"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-1 flex-col gap-1">
                    <span
                      onDoubleClick={() => startEditing(todo)}
                      className={`cursor-text truncate text-sm transition-colors ${
                        todo.completed
                          ? "text-zinc-400 line-through dark:text-zinc-500"
                          : "text-zinc-800 dark:text-zinc-100"
                      }`}
                      title="더블클릭하여 수정"
                    >
                      {todo.text}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.badge}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${meta.dot}`}
                        />
                        {meta.label}
                      </span>
                      {dueLabel && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            overdue
                              ? "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300"
                              : "bg-black/[.04] text-zinc-500 dark:bg-white/[.06] dark:text-zinc-400"
                          }`}
                        >
                          {overdue ? "⚠" : "🗓"} {dueLabel}
                          {overdue ? " (기한 지남)" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {editingId !== todo.id && (
                  <button
                    onClick={() => todoStore.remove(todo.id)}
                    className="shrink-0 rounded-lg p-1.5 text-zinc-400 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100"
                    aria-label="삭제"
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    >
                      <path d="M4 4l8 8M12 4l-8 8" />
                    </svg>
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        {completedCount > 0 && (
          <button
            onClick={() => todoStore.clearCompleted()}
            className="mt-4 w-full rounded-xl border border-black/[.08] py-2 text-xs font-medium text-zinc-500 transition-all hover:border-red-300/60 hover:bg-red-500/5 hover:text-red-500 dark:border-white/[.1] dark:text-zinc-400"
          >
            완료된 항목 {completedCount}개 지우기
          </button>
        )}
      </div>
    </div>
  );
}
