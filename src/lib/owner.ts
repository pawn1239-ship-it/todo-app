import { cookies } from "next/headers";

const OWNER_COOKIE = "todo_owner";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** owner_id 컬럼이 uuid 타입이라, 형식이 깨진 값은 그대로 넘기면 Postgres가 던진다. */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 이 브라우저가 소유한 목록의 ID를 돌려준다. 없으면 새로 발급해 쿠키에 심는다.
 *
 * 로그인이 없는 대신 쿠키 하나로 방문자를 구분한다. httpOnly라서 페이지
 * 스크립트가 값을 읽거나 남의 ID로 바꿔치기할 수 없다. 다만 요청 헤더는
 * 얼마든지 위조할 수 있으므로 "비밀"이 아니라 "격리"용으로만 본다 —
 * ID를 아는 사람은 그 목록에 접근할 수 있다.
 *
 * 라우트 핸들러에서만 호출한다. 서버 컴포넌트 렌더링 중에는 쿠키를 못 쓴다.
 */
export async function getOwnerId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(OWNER_COOKIE)?.value;
  if (existing && UUID_RE.test(existing)) return existing;

  // 없거나 형식이 깨졌으면 새로 발급한다.
  const id = crypto.randomUUID();
  jar.set(OWNER_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });
  return id;
}
