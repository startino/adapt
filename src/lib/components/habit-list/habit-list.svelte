<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import { Check, Settings } from 'lucide-svelte';
	import type { Habit } from '$lib/server/db/schema';
	import HabitEdit from './habit-edit.svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { z } from 'zod';
	import { updateHabitSchema } from '$lib/schemas';

	type Props = {
		habits: Habit[];
		activeCategory: string;
		form: SuperValidated<z.infer<typeof updateHabitSchema>>;
	};

	let { habits = $bindable([]), activeCategory, form }: Props = $props();
	let editingHabit = $state<Habit | null>(null);
	let isSubmitting = $state<string | null>(null);

	async function handleComplete(id: string) {
		if (isSubmitting === id) return;
		isSubmitting = id;
		try {
			// TODO: Implement habit completion API call
			await new Promise((resolve) => setTimeout(resolve, 1000));
		} finally {
			isSubmitting = null;
		}
	}
</script>

{#if editingHabit}
	<HabitEdit {form} habit={editingHabit} onClose={() => (editingHabit = null)} />
{:else}
	<div class="grid gap-4">
		{#each habits.filter((h) => h.category === activeCategory) as habit}
			<Card.Root>
				<Card.Content class="flex items-center justify-between p-4">
					<div class="flex items-center gap-4">
						<Avatar.Root class="h-12 w-12">
							<Avatar.Fallback class="bg-primary/10 text-xl">
								{habit.icon}
							</Avatar.Fallback>
						</Avatar.Root>
						<div>
							<h3 class="font-medium">{habit.name}</h3>
							<p class="text-muted-foreground text-sm">{habit.description}</p>
						</div>
					</div>
					<div class="flex items-center gap-4">
						<Button
							variant="outline"
							size="icon"
							class="rounded-full"
							onclick={() => handleComplete(habit.id)}
							disabled={isSubmitting === habit.id}
						>
							{#if isSubmitting === habit.id}
								<span class="animate-spin">◌</span>
							{:else}
								<Check class="h-5 w-5" />
							{/if}
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onclick={() => {
								editingHabit = habit;
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
