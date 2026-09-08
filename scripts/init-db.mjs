// DB 스키마 초기화 스크립트.
//   node --env-file=.env.local scripts/init-db.mjs
// 여러 번 돌려도 안전하다. 사용자 구분(owner_id) 도입 전 테이블도 그대로 마이그레이션한다.
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// owner_id 없이 만들어진 기존 항목을 담아 둘 자리. 실제 방문자 쿠키와는
// 절대 겹치지 않는 값이라, 아래 항목들은 아무 브라우저에도 보이지 않는다.
const LEGACY_OWNER = "00000000-0000-0000-0000-000000000000";

await sql`
  CREATE TABLE IF NOT EXISTS todos (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id   uuid NOT NULL,
    text       text NOT NULL,
    completed  boolean NOT NULL DEFAULT false,
    created_at bigint NOT NULL,
    priority   text NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    due_date   text,
    due_time   text
  )
`;

// ---- 기존 테이블 마이그레이션 ----
// 이미 todos가 있던 DB라면 owner_id가 없다. 널 허용으로 추가 → 기존 행 채움
// → NOT NULL 승격 순서로 가야 중간에 제약 위반이 나지 않는다.
await sql`ALTER TABLE todos ADD COLUMN IF NOT EXISTS owner_id uuid`;
const [{ orphaned }] = await sql`
  SELECT count(*)::int AS orphaned FROM todos WHERE owner_id IS NULL
`;
if (orphaned > 0) {
  await sql`UPDATE todos SET owner_id = ${LEGACY_OWNER} WHERE owner_id IS NULL`;
}
await sql`ALTER TABLE todos ALTER COLUMN owner_id SET NOT NULL`;

// 목록 조회는 항상 owner_id로 걸러 낸 뒤 최신순으로 정렬한다.
await sql`
  CREATE INDEX IF NOT EXISTS todos_owner_created_idx
  ON todos (owner_id, created_at DESC)
`;

const [{ count }] = await sql`SELECT count(*)::int AS count FROM todos`;
console.log(`todos 테이블 준비 완료 (현재 ${count}건).`);
if (orphaned > 0) {
  console.log(
    `주인 없던 항목 ${orphaned}건을 ${LEGACY_OWNER}로 옮겼습니다. ` +
      `어느 브라우저에도 보이지 않으니, 필요 없으면 지우세요:\n` +
      `  DELETE FROM todos WHERE owner_id = '${LEGACY_OWNER}';`,
  );
}
