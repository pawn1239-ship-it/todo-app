import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let cached: NeonQueryFunction<false, false> | null = null;

/** 앞뒤 BOM(U+FEFF)·공백·따옴표를 제거한다. */
function sanitize(raw: string): string {
  let s = raw.trim();
  while (s.length > 0 && s.charCodeAt(0) === 0xfeff) s = s.slice(1);
  s = s.trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1);
  }
  return s;
}

/**
 * Neon HTTP 드라이버를 지연 초기화해서 돌려준다.
 * 모듈 로드 시점(빌드의 page-data 수집 등)에는 커넥션을 만들지 않는다 —
 * 실제 요청이 들어와 쿼리를 실행할 때만 DATABASE_URL을 읽는다.
 */
export function getSql(): NeonQueryFunction<false, false> {
  if (!cached) {
    const raw = process.env.DATABASE_URL;
    const url = raw ? sanitize(raw) : "";
    if (!url) {
      throw new Error(
        "DATABASE_URL 환경변수가 설정되지 않았습니다. (.env.local 또는 배포 환경변수 확인)",
      );
    }
    cached = neon(url);
  }
  return cached;
}
