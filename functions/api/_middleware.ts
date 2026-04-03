// Shared type for all Pages Functions
interface Env {
  DB: D1Database;
}

interface UserInfo {
  email: string;
  name: string;
}

// Default demo user when Cloudflare Access is not configured
const DEMO_USER: UserInfo = { email: 'explorer@cryptids.education', name: 'Explorer' };

// Extract user from Cloudflare Access JWT (already validated by Access)
function getUserFromRequest(request: Request): UserInfo {
  const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!jwt) return DEMO_USER;
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    return {
      email: payload.email || DEMO_USER.email,
      name: payload.email?.split('@')[0] || DEMO_USER.name,
    };
  } catch {
    return DEMO_USER;
  }
}

// Middleware: attach user info to all /api/ requests
export const onRequest: PagesFunction<Env> = async (context) => {
  context.data.user = getUserFromRequest(context.request);
  return context.next();
};
