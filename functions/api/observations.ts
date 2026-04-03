interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const user = context.data.user as { email: string };
  const { results } = await context.env.DB.prepare(
    'SELECT * FROM observations WHERE user_id = ? ORDER BY created_at DESC'
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
    'INSERT INTO observations (id, user_id, cryptid_name, description, location_name, lat, lng, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    id, user.email,
    body.cryptidName, body.description, body.locationName,
    body.lat ?? 0, body.lng ?? 0, body.address ?? body.locationName
  ).run();
  return new Response(JSON.stringify({ id }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
