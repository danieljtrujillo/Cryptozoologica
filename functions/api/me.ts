interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const user = context.data.user as { email: string; name: string };
  return new Response(JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' },
  });
};
