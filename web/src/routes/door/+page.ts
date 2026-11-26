import { listUpcomingEvents } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => ({ events: await listUpcomingEvents(fetch) });
