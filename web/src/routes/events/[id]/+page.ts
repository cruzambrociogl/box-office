import { error } from '@sveltejs/kit';
import { ApiError, getEvent } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
  try {
    return { event: await getEvent(params.id, fetch) };
  } catch (err) {
    if (err instanceof ApiError) error(err.status, 'This event does not exist');
    throw err;
  }
};
