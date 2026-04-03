interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const user = context.data.user as { email: string };
  const { results } = await context.env.DB.prepare(
    'SELECT * FROM saved_locations WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(user.email).all();
  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const user = context.data.user as { email: string };
  const body = await context.request.json() as any;
  const id = crypto.randomUUID();
  await context.env.DB.prepare(
    'INSERT INTO saved_locations (id, user_id, name, description, lat, lng) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(id, user.email, body.name, body.description ?? '', body.lat, body.lng).run();
  return new Response(JSON.stringify({ id }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
