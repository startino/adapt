import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { userHabits } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const POST = async ({ params, locals, request }) => {
	const { id } = params;
	const { daily_schedules } = await request.json();

	const {
		data: { user }
	} = await locals.supabase.auth.getUser();

	if (!user) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	try {
		// Update the user habit's schedule
		await db
			.update(userHabits)
			.set({
				daily_schedules,
				updated_at: new Date()
			})
			.where(and(eq(userHabits.id, id), eq(userHabits.user_id, user.id)));

		return json({ success: true });
	} catch (error) {
		console.error('Error updating habit schedule:', error);
		return json({ success: false, message: 'Failed to update habit schedule' }, { status: 500 });
	}
};
