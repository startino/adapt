import { redirect } from '@sveltejs/kit';

export const POST = async ({ locals }) => {
	const { supabase } = locals;
	await supabase.auth.signOut();

	redirect(303, '/login');
};

// Handle GET requests too for simplicity
export const GET = async ({ locals }) => {
	const { supabase } = locals;
	await supabase.auth.signOut();

	redirect(303, '/login');
};
