import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

const schema = z.object({
	email: z.string().email(),
	password: z.string().min(6)
});

export const load = async () => {
	const form = await superValidate(zod(schema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, zod(schema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { error } = await locals.supabase.auth.signInWithPassword({
			email: form.data.email,
			password: form.data.password
		});

		if (error) {
			return fail(400, {
				form,
				error: error.message
			});
		}

		throw redirect(303, '/');
	}
};
