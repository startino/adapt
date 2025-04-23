import { redirect } from '@sveltejs/kit';

export const GET = async ({ url, locals }) => {
	const { supabase } = locals;
	const code = url.searchParams.get('code');

	if (code) {
		await supabase.auth.exchangeCodeForSession(code);
	}

	redirect(303, '/');
};
