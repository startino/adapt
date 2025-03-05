import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { habits } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions } from './$types';

const habitSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	description: z.string().optional(),
	category: z.enum(['move', 'eat', 'sleep', 'mind']),
	icon: z.string().min(1, 'Icon is required')
});

export const load = async ({ locals }) => {
	const {
		data: { user }
	} = await locals.supabase.auth.getUser();

	const userHabits = await db
		.select()
		.from(habits)
		.where(eq(habits.owner_id, user?.id ?? ''));

	const form = await superValidate(zod(habitSchema));

	return {
		form,
		user,
		habits: userHabits
	};
};

export const actions: Actions = {
	createHabit: async ({ request, locals }) => {
		const form = await superValidate(request, zod(habitSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const {
			data: { user }
		} = await locals.supabase.auth.getUser();

		if (!user) {
			return fail(401, { form, error: 'Unauthorized' });
		}

		try {
			await db.insert(habits).values({
				name: form.data.name,
				description: form.data.description,
				category: form.data.category,
				icon: form.data.icon,
				owner_id: user.id
			});

			return { form };
		} catch (error) {
			console.error('Error creating habit:', error);
			return fail(500, { form, error: 'Failed to create habit' });
		}
	}
};
