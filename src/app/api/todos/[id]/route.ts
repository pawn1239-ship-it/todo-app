import { NextResponse, type NextRequest } from "next/server";
import { getOwnerId } from "@/lib/owner";
import { deleteTodo, editTodo, setCompleted } from "@/lib/todosRepo";
import type { Priority } from "@/lib/todoTypes";

const PRIORITIES: Priority[] = ["high", "medium", "low"];

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/todos/[id]">,
) {
  const ownerId = await getOwnerId();
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "잘못된 요청 본문" }, { status: 400 });
  }

  // completed만 담겨 있으면 토글/체크 처리
  if (
    typeof body.completed === "boolean" &&
    body.text === undefined &&
    body.priority === undefined
  ) {
    const todo = await setCompleted(ownerId, id, body.completed);
    return todo
      ? NextResponse.json(todo)
      : NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "text는 필수입니다." }, { status: 400 });
  }
  const priority: Priority = PRIORITIES.includes(body.priority)
    ? body.priority
    : "medium";
  const dueDate =
    typeof body.dueDate === "string" && body.dueDate ? body.dueDate : null;
  const dueTime =
    dueDate && typeof body.dueTime === "string" && body.dueTime
      ? body.dueTime
      : null;

  const todo = await editTodo(ownerId, id, { text, priority, dueDate, dueTime });
  return todo
    ? NextResponse.json(todo)
    : NextResponse.json({ error: "not found" }, { status: 404 });
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/todos/[id]">,
) {
  const ownerId = await getOwnerId();
  const { id } = await ctx.params;
  await deleteTodo(ownerId, id);
  return NextResponse.json({ ok: true });
}
