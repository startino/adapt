import {
	pgTable,
	boolean,
	text,
	integer,
	timestamp,
	uuid,
	jsonb,
	numeric,
	date,
	time
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const profiles = pgTable('profiles', {
	id: uuid('id').primaryKey(),
	email: text('email').notNull().unique(),
	is_admin: boolean('is_admin').notNull().default(false),
	goal_what: text('goal_what'),
	goal_why: text('goal_why'),
	goal_timeline: timestamp('goal_timeline', { withTimezone: true, mode: 'date' }),
	coaching_notes: text('coaching_notes').array(),
	created_at: timestamp('created_at', { withTimezone: true, mode: 'date' })
		.notNull()
		.default(sql`now()`),
	updated_at: timestamp('updated_at', { withTimezone: true, mode: 'date' })
		.notNull()
		.default(sql`now()`),
	first_name: text('first_name'),
	last_name: text('last_name'),
	date_of_birth: date('date_of_birth'),
	mobile_number: text('mobile_number'),
	mobile_country_code: text('mobile_country_code'),
	preferred_weight_unit: text('preferred_weight_unit').default('kg'),
	target_weight: numeric('target_weight', { precision: 5, scale: 2 }),
	sex: text('sex')
});

export const analyticsConfigs = pgTable('analytics_configs', {
	id: uuid('id').primaryKey().defaultRandom(),
	key: text('key').notNull().unique(),
	value: jsonb('value').notNull(),
	description: text('description'),
	created_at: timestamp('created_at', { withTimezone: true, mode: 'date' })
		.notNull()
		.default(sql`now()`),
	updated_at: timestamp('updated_at', { withTimezone: true, mode: 'date' })
		.notNull()
		.default(sql`now()`),
	updated_by: uuid('updated_by').references(() => profiles.id)
});

export const chatMessages = pgTable('chat_messages', {
	id: uuid('id').primaryKey().defaultRandom(),
	user_id: uuid('user_id').references(() => profiles.id),
	content: text('content').notNull(),
	is_ai: boolean('is_ai').default(false),
	created_at: timestamp('created_at', { withTimezone: true, mode: 'date' })
		.notNull()
		.default(sql`now()`)
});

export const habitCompTracks = pgTable('habit_comp_tracks', {
	id: uuid('id').primaryKey().defaultRandom(),
	user_habit_id: uuid('user_habit_id').references(() => userHabits.id, { onDelete: 'cascade' }),
	completed_at: timestamp('completed_at', { withTimezone: true, mode: 'date' })
		.notNull()
		.default(sql`now()`),
	date: date('date').default(sql`CURRENT_DATE`),
	evt_time: time('evt_time'),
	last_completion_at: timestamp('last_completion_at', { withTimezone: true, mode: 'date' })
		.notNull()
		.default(sql`now()`),
	reminder_time: time('reminder_time')
});

export const habits = pgTable('habits', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	description: text('description'),
	created_at: timestamp('created_at', { withTimezone: true, mode: 'date' })
		.notNull()
		.default(sql`now()`),
	updated_at: timestamp('updated_at', { withTimezone: true, mode: 'date' })
		.notNull()
		.default(sql`now()`)
});

export const pushSubscriptions = pgTable('push_subscriptions', {
	id: uuid('id').primaryKey().defaultRandom(),
	user_id: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
	subscription: jsonb('subscription').notNull(),
	created_at: timestamp('created_at', { withTimezone: true, mode: 'date' })
		.notNull()
		.default(sql`now()`),
	updated_at: timestamp('updated_at', { withTimezone: true, mode: 'date' })
		.notNull()
		.default(sql`now()`)
});

export const reminders = pgTable('reminders', {
	id: uuid('id').primaryKey().defaultRandom(),
	user_id: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
	habit_id: uuid('habit_id').references(() => habits.id, { onDelete: 'cascade' }),
	user_habit_id: uuid('user_habit_id').references(() => userHabits.id, { onDelete: 'cascade' }),
	scheduled_for: timestamp('scheduled_for', { withTimezone: true, mode: 'date' }).notNull(),
	event_time: time('event_time').notNull(),
	sent_at: timestamp('sent_at', { withTimezone: true, mode: 'date' }),
	created_at: timestamp('created_at', { withTimezone: true, mode: 'date' })
		.notNull()
		.default(sql`now()`)
});

export const userHabits = pgTable('user_habits', {
	id: uuid('id').primaryKey().defaultRandom(),
	user_id: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
	habit_id: uuid('habit_id').references(() => habits.id, { onDelete: 'cascade' }),
	created_at: timestamp('created_at', { withTimezone: true, mode: 'date' })
		.notNull()
		.default(sql`now()`),
	updated_at: timestamp('updated_at', { withTimezone: true, mode: 'date' })
		.notNull()
		.default(sql`now()`)
});

export const userHabitTimeBlocks = pgTable('user_habit_time_blocks', {
	id: uuid('id').primaryKey().defaultRandom(),
	user_habit_id: uuid('user_habit_id').references(() => userHabits.id, { onDelete: 'cascade' }),
	user_id: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
	time_block: text('time_block').notNull(),
	completion_count: integer('completion_count')
		.notNull()
		.default(sql`0`),
	total_scheduled: integer('total_scheduled')
		.notNull()
		.default(sql`0`),
	success_rate: numeric('success_rate', { precision: 5, scale: 2 })
		.notNull()
		.default(sql`0`),
	updated_at: timestamp('updated_at', { withTimezone: true, mode: 'date' })
		.notNull()
		.default(sql`now()`)
});

export const userHabitAnalytics = pgTable('user_habit_analytics', {
	id: uuid('id').primaryKey().defaultRandom(),
	user_habit_id: uuid('user_habit_id').references(() => userHabits.id, { onDelete: 'cascade' }),
	user_id: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
	completion_score: numeric('completion_score', { precision: 5, scale: 2 })
		.notNull()
		.default(sql`0`),
	completion_trend: numeric('completion_trend', { precision: 5, scale: 2 })
		.notNull()
		.default(sql`0`),
	best_time_block: jsonb('best_time_block'),
	worst_time_block: jsonb('worst_time_block'),
	day_of_week_pattern: jsonb('day_of_week_pattern'),
	seasonal_pattern: jsonb('seasonal_pattern'),
	analysis_period: text('analysis_period').notNull(),
	updated_at: timestamp('updated_at', { withTimezone: true, mode: 'date' })
		.notNull()
		.default(sql`now()`)
});

export const weightEntries = pgTable('weight_entries', {
	id: uuid('id').primaryKey().defaultRandom(),
	user_id: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
	weight: numeric('weight', { precision: 5, scale: 2 }).notNull(),
	unit: text('unit').notNull(),
	recorded_at: timestamp('recorded_at', { withTimezone: true, mode: 'date' })
		.notNull()
		.default(sql`now()`),
	notes: text('notes'),
	created_at: timestamp('created_at', { withTimezone: true, mode: 'date' })
		.notNull()
		.default(sql`now()`),
	updated_at: timestamp('updated_at', { withTimezone: true, mode: 'date' })
		.notNull()
		.default(sql`now()`)
});

// Types
export type Profile = typeof profiles.$inferSelect;
export type AnalyticsConfig = typeof analyticsConfigs.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type HabitCompTrack = typeof habitCompTracks.$inferSelect;
export type Habit = typeof habits.$inferSelect;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type Reminder = typeof reminders.$inferSelect;
export type UserHabit = typeof userHabits.$inferSelect;
export type UserHabitTimeBlock = typeof userHabitTimeBlocks.$inferSelect;
export type UserHabitAnalytic = typeof userHabitAnalytics.$inferSelect;
export type WeightEntry = typeof weightEntries.$inferSelect;
