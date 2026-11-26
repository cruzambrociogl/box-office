import { env } from '$env/dynamic/private';
import type { Handle } from '@sveltejs/kit';

// Requests to /api/… go on to the API, so the browser and the pages talk to one address.
export const handle: Handle = async ({ event, resolve }) => {
  if (!event.url.pathname.startsWith('/api/')) return resolve(event);
  const target = new URL(event.url.pathname + event.url.search, env.API_URL ?? 'http://localhost:3000');
  const headers = new Headers(event.request.headers);
  headers.delete('host');
  const method = event.request.method;
  const body = method === 'GET' || method === 'HEAD' ? undefined : await event.request.arrayBuffer();
  return fetch(target, { method, headers, body });
};
