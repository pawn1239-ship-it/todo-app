import { NextResponse, type NextRequest } from "next/server";
import { getOwnerId } from "@/lib/owner";
import { clearCompleted, createTodo, listTodos } from "@/lib/todosRepo";
import type { Priority } from "@/lib/todoTypes";

const PRIORITIES: Priority[] = ["high", "medium", "low"];

export async function GET() {
  const ownerId = await getOwnerId();
  return NextResponse.json(await listTodos(ownerId));
}

export async function POST(req: NextRequest) {
  const ownerId = await getOwnerId();
  const body = await req.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "text는 필수입니다." }, { status: 400 });
  }
  const priority: Priority = PRIORITIES.includes(body?.priority)
    ? body.priority
    : "medium";
  const dueDate =
    typeof body?.dueDate === "string" && body.dueDate ? body.dueDate : null;
  const dueTime =
    dueDate && typeof body?.dueTime === "string" && body.dueTime
      ? body.dueTime
      : null;

  const todo = await createTodo(ownerId, { text, priority, dueDate, dueTime });
  return NextResponse.json(todo, { status: 201 });
}

export async function DELETE() {
  const ownerId = await getOwnerId();
  await clearCompleted(ownerId);
  return NextResponse.json({ ok: true });
}
