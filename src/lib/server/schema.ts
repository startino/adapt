import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import type { Database } from '$lib/types/supabase';

export const profiles = pgTable('profiles', {
	id: text('id')
		.primaryKey()
		.references(() => 'auth.users.id'),
	email: text('email').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});
