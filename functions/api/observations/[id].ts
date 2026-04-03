interface Env {
  DB: D1Database;
}

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const user = context.data.user as { email: string };
  const id = context.params.id as string;
  await context.env.DB.prepare(
    'DELETE FROM observations WHERE id = ? AND user_id = ?'
  ).bind(id, user.email).run();
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
