import { db } from '$lib/server/db';
import { habits } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';

export async function load({ locals }) {
	const session = await locals.getSession();
	if (!session) {
		error(401, 'Unauthorized');
	}

	const allHabits = await db
		.select({
			id: habits.id,
			name: habits.name,
			description: habits.description,
			category: habits.category,
			icon: habits.icon,
			owner_id: habits.owner_id
		})
		.from(habits)
		.orderBy(habits.name);

	return {
		user: session.user,
		habits: allHabits
	};
}
