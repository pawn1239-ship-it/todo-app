import TodoApp from "@/components/TodoApp";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-6 font-sans dark:from-[#0b0b14] dark:via-[#0d0a1a] dark:to-[#0a0a0a]">
      {/* 배경 오로라 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="aurora-blob absolute -left-24 -top-24 h-96 w-96 rounded-full bg-fuchsia-400/25 blur-3xl dark:bg-fuchsia-600/25" />
        <div className="aurora-blob absolute -right-32 top-1/3 h-[28rem] w-[28rem] rounded-full bg-sky-400/25 blur-3xl dark:bg-sky-600/25" />
        <div className="aurora-blob absolute bottom-[-10rem] left-1/3 h-96 w-96 rounded-full bg-violet-400/25 blur-3xl dark:bg-violet-600/25" />
      </div>

      <TodoApp />
    </div>
  );
}
