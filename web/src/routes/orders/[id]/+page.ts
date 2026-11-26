import { error } from '@sveltejs/kit';
import { ApiError, getOrder } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
  try {
    return { order: await getOrder(params.id, fetch) };
  } catch (err) {
    if (err instanceof ApiError) error(err.status, 'This order does not exist');
    throw err;
  }
};
