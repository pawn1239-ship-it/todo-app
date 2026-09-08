import TodoApp from "@/components/TodoApp";
import Ufo from "@/components/Ufo";

export default function Home() {
  return (
    <div className="cosmos relative flex min-h-screen flex-1 items-center justify-center overflow-hidden p-6 font-sans">
      {/* 성운 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="aurora-blob absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-fuchsia-600/25 blur-[110px]" />
        <div className="aurora-blob absolute -right-48 top-1/4 h-[38rem] w-[38rem] rounded-full bg-indigo-500/25 blur-[120px]" />
        <div className="aurora-blob absolute bottom-[-16rem] left-1/4 h-[32rem] w-[32rem] rounded-full bg-cyan-500/20 blur-[110px]" />
      </div>

      {/* 먼 행성 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="planet absolute -right-16 -top-16 h-56 w-56 opacity-60 sm:right-[6%] sm:top-[8%] sm:h-64 sm:w-64" />
      </div>

      {/* 별 — 시차를 위해 레이어마다 속도가 다르다 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="stars stars-sm" />
        <div className="stars stars-md" />
        <div className="stars stars-lg" />
      </div>

      {/* 유성 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="shooting-star" />
        <span className="shooting-star" />
        <span className="shooting-star" />
      </div>

      {/* 외계인이 탄 UFO */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Ufo />
      </div>

      {/* 비네트 */}
      <div className="vignette pointer-events-none absolute inset-0" />

      <TodoApp />
    </div>
  );
}
