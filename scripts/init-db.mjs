// DB 스키마 초기화 스크립트.
//   node --env-file=.env.local scripts/init-db.mjs
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS todos (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    text       text NOT NULL,
    completed  boolean NOT NULL DEFAULT false,
    created_at bigint NOT NULL,
    priority   text NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    due_date   text,
    due_time   text
  )
`;

await sql`CREATE INDEX IF NOT EXISTS todos_created_at_idx ON todos (created_at DESC)`;

const [{ count }] = await sql`SELECT count(*)::int AS count FROM todos`;
if (count === 0) {
  await sql`
    INSERT INTO todos (text, completed, created_at, priority)
    VALUES ('서울', false, ${Date.now()}, 'medium')
  `;
  console.log("시드 항목 1건 삽입 완료.");
}

console.log(`todos 테이블 준비 완료 (현재 ${count}건).`);
