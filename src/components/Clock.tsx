"use client";

import { useSyncExternalStore } from "react";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function subscribe(onChange: () => void) {
  // 초 경계에 최대 250ms만 늦게 붙도록 촘촘히 확인한다.
  // 스냅샷이 초 단위라 같은 초 안에서는 재렌더가 일어나지 않는다.
  const id = setInterval(onChange, 250);
  return () => clearInterval(id);
}

/** 초 단위로 잘라 둔 스냅샷 — 같은 초면 같은 값이라 렌더가 안정적이다. */
function getSnapshot(): number {
  return Math.floor(Date.now() / 1000);
}

/** 서버 시각과 클라이언트 시각은 애초에 다르다 — 서버에서는 그리지 않는다. */
function getServerSnapshot(): number | null {
  return null;
}

function format(d: Date) {
  const date = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]})`;
  const hours = d.getHours();
  const period = hours < 12 ? "오전" : "오후";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return { date, time: `${period} ${hour12}:${mm}:${ss}` };
}

/**
 * 카드 머리의 오늘 날짜·시각. 1초마다 갱신한다.
 * min-h로 자리를 미리 잡아 두어 첫 틱에 아래 내용이 밀리지 않는다.
 */
export default function Clock() {
  const seconds = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const parts = seconds === null ? null : format(new Date(seconds * 1000));

  return (
    <p className="mb-2 flex min-h-[1.125rem] items-center justify-center gap-2 text-[11px] font-medium tracking-wide text-zinc-500 dark:text-zinc-400">
      {parts && (
        <>
          <span>{parts.date}</span>
          <span aria-hidden className="text-zinc-300 dark:text-zinc-600">
            ·
          </span>
          <time className="font-mono tabular-nums text-zinc-600 dark:text-zinc-300">
            {parts.time}
          </time>
        </>
      )}
    </p>
  );
}
