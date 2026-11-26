import { listOrganisers } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => ({ organisers: await listOrganisers(fetch) });
