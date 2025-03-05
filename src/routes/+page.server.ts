import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { habits } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { Actions } from './$types';
import { habitSchema, updateHabitSchema } from '$lib/schemas';

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
	},

	updateHabit: async ({ request, locals }) => {
		const form = await superValidate(request, zod(updateHabitSchema));

		if (!form.valid) {
			console.log(form.errors);
			return fail(400, { form });
		}

		const {
			data: { user }
		} = await locals.supabase.auth.getUser();

		if (!user) {
			return fail(401, { form, error: 'Unauthorized' });
		}

		try {
			const { id, ...updateData } = form.data;
			await db
				.update(habits)
				.set({
					...updateData,
					updated_at: new Date()
				})
				.where(and(eq(habits.id, id), eq(habits.owner_id, user.id)));

			return { form };
		} catch (error) {
			console.error('Error updating habit:', error);
			return fail(500, { form, error: 'Failed to update habit' });
		}
	}
};
