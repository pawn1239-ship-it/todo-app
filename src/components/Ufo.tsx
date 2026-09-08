/**
 * 배경 장식용 UFO — 외계인 조종사가 돔 안에 보인다.
 * 순수 SVG + CSS 애니메이션이라 클라이언트 훅이 필요 없다(서버 컴포넌트).
 * 화면 밖 가로 이동은 .ufo-drift, 위아래 흔들림은 .ufo-bob이 나눠 맡는다
 * — transform 하나에 두 애니메이션을 겹칠 수 없어서 래퍼를 둘로 나눴다.
 */
export default function Ufo() {
  return (
    <div className="ufo-drift pointer-events-none absolute top-[16%] left-0">
      <div className="ufo-bob">
        <svg
          viewBox="0 0 160 150"
          className="h-auto w-32 drop-shadow-[0_0_28px_rgba(94,234,212,0.28)] sm:w-40"
          aria-hidden
        >
          <defs>
            <linearGradient id="ufo-hull" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#cbd5f5" />
              <stop offset="45%" stopColor="#7c8ac4" />
              <stop offset="100%" stopColor="#2b2f56" />
            </linearGradient>
            <linearGradient id="ufo-hull-top" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#eef2ff" />
              <stop offset="100%" stopColor="#8b95d6" />
            </linearGradient>
            <linearGradient id="ufo-dome" x1="0.2" y1="0" x2="0.8" y2="1">
              <stop offset="0%" stopColor="#a5f3fc" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="ufo-head" x1="0.3" y1="0" x2="0.7" y2="1">
              <stop offset="0%" stopColor="#bbf7d0" />
              <stop offset="100%" stopColor="#4ade80" />
            </linearGradient>
            <linearGradient id="ufo-beam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5eead4" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#5eead4" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* 트랙터 빔 */}
          <path
            className="ufo-beam"
            d="M62 62 L34 146 L126 146 L98 62 Z"
            fill="url(#ufo-beam)"
          />

          {/* 유리 돔 */}
          <path
            d="M46 54 A34 34 0 0 1 114 54 Z"
            fill="url(#ufo-dome)"
            stroke="rgba(191,219,254,0.55)"
            strokeWidth="1.5"
          />

          {/* 외계인 조종사 */}
          <g>
            {/* 어깨 */}
            <ellipse cx="80" cy="54" rx="12" ry="6" fill="#4ade80" />
            {/* 목 */}
            <rect x="77" y="46" width="6" height="6" fill="#4ade80" />
            {/* 머리 */}
            <ellipse cx="80" cy="37" rx="13" ry="15" fill="url(#ufo-head)" />
            {/* 눈 */}
            <ellipse
              cx="74.5"
              cy="37"
              rx="3.6"
              ry="5.4"
              fill="#0a0a14"
              transform="rotate(-20 74.5 37)"
            />
            <ellipse
              cx="85.5"
              cy="37"
              rx="3.6"
              ry="5.4"
              fill="#0a0a14"
              transform="rotate(20 85.5 37)"
            />
            {/* 눈 반사광 */}
            <circle cx="73.4" cy="35" r="1" fill="#ffffff" opacity="0.85" />
            <circle cx="84.4" cy="35" r="1" fill="#ffffff" opacity="0.85" />
            {/* 입 */}
            <path
              d="M77.5 45.5 Q80 47.2 82.5 45.5"
              stroke="#166534"
              strokeWidth="1.2"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* 돔 하이라이트 — 조종사 위에 유리 반사를 얹는다 */}
          <path
            d="M56 52 A24 24 0 0 1 72 30 A30 30 0 0 0 58 52 Z"
            fill="#ffffff"
            opacity="0.35"
          />

          {/* 선체 */}
          <ellipse cx="80" cy="54" rx="52" ry="9" fill="url(#ufo-hull-top)" />
          <ellipse cx="80" cy="58" rx="72" ry="12" fill="url(#ufo-hull)" />
          <ellipse
            cx="80"
            cy="56.5"
            rx="72"
            ry="9"
            fill="#e0e7ff"
            opacity="0.25"
          />

          {/* 선체 하단 조명 */}
          {[20, 40, 60, 80, 100, 120, 140].map((cx, i) => (
            <circle
              key={cx}
              className="ufo-light"
              cx={cx}
              cy={64 - Math.abs(cx - 80) * 0.055}
              r="3"
              fill="#5eead4"
              style={{ animationDelay: `${i * 0.16}s` }}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
