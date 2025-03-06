<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import { Switch } from '$lib/components/ui/switch';
	import { Settings } from 'lucide-svelte';
	import type { Habit, UserHabit } from '$lib/server/db/schema';
	import HabitEdit from './habit-edit.svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { z } from 'zod';
	import { updateHabitSchema } from '$lib/schemas';

	type Props = {
		habitsWithSettings: {
			habits: Habit;
			user_habits: UserHabit;
		}[];
		activeCategory: string;
		form: SuperValidated<z.infer<typeof updateHabitSchema>>;
	};

	let { habitsWithSettings, activeCategory, form }: Props = $props();
	let editingHabit = $state<Habit | null>(null);
	let isSubmitting = $state<string | null>(null);

	async function toggleHabitActive(id: string, isActive: boolean) {
		if (isSubmitting === id) return;
		isSubmitting = id;
		try {
			const response = await fetch(`/api/habits/${id}/toggle`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ active: isActive })
			});

			const result = await response.json();

			if (!result.success) {
				console.error('Failed to toggle habit:', result.message);
				// Optionally add error handling UI here
			} else {
				// Update the local state to reflect the change
				habitsWithSettings = habitsWithSettings.map((habit) => {
					if (habit.user_habits.id === id) {
						return {
							...habit,
							user_habits: {
								...habit.user_habits,
								active: isActive
							}
						};
					}
					return habit;
				});
			}
		} catch (error) {
			console.error('Error toggling habit:', error);
			// Optionally add error handling UI here
		} finally {
			isSubmitting = null;
		}
	}
</script>

{#if editingHabit}
	<HabitEdit {form} habit={editingHabit} onClose={() => (editingHabit = null)} />
{:else}
	<div class="grid gap-4">
		{#each habitsWithSettings.filter((h) => h.habits.category === activeCategory) as habitWithSettings}
			<Card.Root>
				<Card.Content class="flex items-center justify-between p-4">
					<div class="flex items-center gap-4">
						<Avatar.Root class="h-12 w-12">
							<Avatar.Fallback class="bg-primary/10 text-xl">
								{habitWithSettings.habits.icon}
							</Avatar.Fallback>
						</Avatar.Root>
						<div>
							<h3 class="font-medium">{habitWithSettings.habits.name}</h3>
							<p class="text-muted-foreground text-sm">{habitWithSettings.habits.description}</p>
						</div>
					</div>
					<div class="flex items-center gap-4">
						<div class="flex items-center space-x-2">
							<Switch
								id={`habit-switch-${habitWithSettings.user_habits.id}`}
								checked={habitWithSettings.user_habits.active ?? false}
								onCheckedChange={() =>
									toggleHabitActive(
										habitWithSettings.user_habits.id,
										!(habitWithSettings.user_habits.active ?? false)
									)}
								disabled={isSubmitting === habitWithSettings.user_habits.id}
							/>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onclick={() => {
								editingHabit = habitWithSettings.habits;
							}}
						>
							<Settings class="h-5 w-5" />
						</Button>
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
{/if}
