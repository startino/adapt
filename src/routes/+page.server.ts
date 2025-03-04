import { db } from '$lib/server/db';
import { profiles } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export const load = async () => {
	const profilesList = await db.select().from(profiles).orderBy(desc(profiles.created_at));

	return {
		profiles: profilesList
	};
};
