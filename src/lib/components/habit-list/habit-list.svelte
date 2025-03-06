<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import { Switch } from '$lib/components/ui/switch';
	import { Settings } from 'lucide-svelte';
	import type { Habit, UserHabit } from '$lib/server/db/schema';
	import HabitSettings from './habit-settings.svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { z } from 'zod';
	import { updateHabitSchema } from '$lib/schemas';
	import { toggleHabitActive } from '$lib/utils';

	type Props = {
		habitsWithSettings: {
			habits: Habit;
			user_habits: UserHabit;
		}[];
		activeCategory: string;
		form: SuperValidated<z.infer<typeof updateHabitSchema>>;
	};

	let { habitsWithSettings, activeCategory, form }: Props = $props();
	let editingHabit = $state<{
		habits: Habit;
		user_habits: UserHabit;
	} | null>(null);
	let isSubmitting = $state<string | null>(null);

	async function handleToggleHabitActive(id: string, isActive: boolean) {
		if (isSubmitting === id) return;
		isSubmitting = id;

		try {
			const result = await toggleHabitActive(id, isActive);

			if (!result.success) {
				console.error('Failed to toggle habit:', result.message);
				// Optionally add error handling UI here
			}
		} catch (error) {
			console.error('Error in toggle handler:', error);
		} finally {
			isSubmitting = null;
		}
	}

	function handleSettingsChange(updatedHabit: { habits: Habit; user_habits: UserHabit }) {
		// Update the habit in the list
		habitsWithSettings = habitsWithSettings.map((habit) => {
			if (habit.habits.id === updatedHabit.habits.id) {
				return updatedHabit;
			}
			return habit;
		});
	}
</script>

{#if editingHabit}
	<HabitSettings
		{form}
		habitWithSettings={editingHabit}
		onClose={() => {
			editingHabit = null;
		}}
		onSettingsChange={handleSettingsChange}
	/>
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
									handleToggleHabitActive(
										habitWithSettings.user_habits.id,
										!habitWithSettings.user_habits.active
									)}
								disabled={isSubmitting === habitWithSettings.user_habits.id}
							/>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onclick={() => {
								editingHabit = habitWithSettings;
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
