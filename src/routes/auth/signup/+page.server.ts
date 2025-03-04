import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/server/db';
import { profiles } from '$lib/server/schema';

const schema = z
	.object({
		email: z.string().email(),
		password: z.string().min(6),
		confirmPassword: z.string().min(6)
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword']
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

		const { data: authData, error: authError } = await locals.supabase.auth.signUp({
			email: form.data.email,
			password: form.data.password
		});

		if (authError) {
			return fail(400, {
				form: {
					...form,
					errors: {
						email: [
							authError.message.includes('already registered')
								? 'This email is already registered. Please login instead.'
								: authError.message
						]
					}
				}
			});
		}

		if (!authData.user) {
			return fail(400, {
				form: {
					...form,
					errors: {
						email: ['Failed to create user']
					}
				}
			});
		}

		// Create profile
		try {
			await db.insert(profiles).values({
				id: authData.user.id,
				email: form.data.email
			});
		} catch (error) {
			// If profile creation fails, we should handle it appropriately
			console.error('Failed to create profile:', error);
			return fail(500, {
				form: {
					...form,
					errors: {
						email: ['Failed to create profile']
					}
				}
			});
		}

		throw redirect(303, '/');
	}
};
