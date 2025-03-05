import { db } from '$lib/server/db';
import { userHabits, habitCompTrack } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq, and, sql } from 'drizzle-orm';

export async function POST({ locals, params }) {
	const session = await locals.getSession();
	if (!session) {
		error(401, 'Unauthorized');
	}

	// Check if user already has this habit
	const existingHabit = await db
		.select()
		.from(userHabits)
		.where(and(eq(userHabits.user_id, session.user.id), eq(userHabits.habit_id, params.id)))
		.limit(1);

	let userHabit = existingHabit[0];

	// If not, create a new user habit
	if (!userHabit) {
		const newHabit = await db
			.insert(userHabits)
			.values({
				user_id: session.user.id,
				habit_id: params.id
			})
			.returning();
		userHabit = newHabit[0];
	}

	// Create a habit completion track
	await db.insert(habitCompTrack).values({
		user_habit_id: userHabit.id,
		date: sql`CURRENT_DATE`
	});

	return new Response(null, { status: 200 });
}
