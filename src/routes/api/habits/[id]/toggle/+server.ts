import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { userHabits } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const POST = async ({ params, locals, request }) => {
	const { id } = params;
	const { active } = await request.json();

	const {
		data: { user }
	} = await locals.supabase.auth.getUser();

	if (!user) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	try {
		// Update the user habit's active status
		await db
			.update(userHabits)
			.set({
				active: active,
				updated_at: new Date()
			})
			.where(and(eq(userHabits.id, id), eq(userHabits.user_id, user.id)));

		return json({ success: true });
	} catch (error) {
		console.error('Error toggling habit active status:', error);
		return json(
			{ success: false, message: 'Failed to toggle habit active status' },
			{ status: 500 }
		);
	}
};
