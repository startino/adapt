import { redirect } from '@sveltejs/kit';

export const load = async ({ parent }) => {
	// Get parent data which includes the session
	const { session, supabase } = await parent();

	// If not logged in, redirect to login
	if (!session) {
		redirect(303, '/login');
	}

	return {
		supabase,
		session
	};
};
