import { z } from 'zod';
import { categories } from '$lib/contants';

export const habitSchema = z.object({
	name: z.string().min(1),
	category: z.enum(categories),
	icon: z.string().min(1),
	description: z.string().optional()
});
export const updateHabitSchema = habitSchema.extend({
	id: z.string().uuid()
});
