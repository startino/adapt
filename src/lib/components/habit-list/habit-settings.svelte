<script lang="ts">
	import type { Habit, UserHabit } from '$lib/server/db/schema';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger,
		SelectValue
	} from '$lib/components/ui/select';
	import * as Card from '$lib/components/ui/card';
	import { ChevronLeft } from 'lucide-svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { updateHabitSchema } from '$lib/schemas';
	import type { z } from 'zod';
	import { zod } from 'sveltekit-superforms/adapters';
	import { categories, type Category } from '$lib/contants';
	import { toggleHabitActive, updateHabitSchedule, type DaySchedule } from '$lib/utils';
	import { HabitSchedule } from './index';

	type Props = {
		form: SuperValidated<z.infer<typeof updateHabitSchema>>;
		onClose: () => void;
		onSettingsChange?: (habitWithSettings: { habits: Habit; user_habits: UserHabit }) => void;
		habitWithSettings: {
			habits: Habit;
			user_habits: UserHabit;
		};
	};

	let { form: validatedForm, onClose, habitWithSettings, onSettingsChange }: Props = $props();
	const { form, enhance, submitting, errors } = superForm(validatedForm, {
		id: 'habit-edit-' + habitWithSettings.habits.id,
		validators: zod(updateHabitSchema),
		dataType: 'json',
		onResult: (data) => {
			if (data.result.type === 'success') {
				// Update the habit data with form values before closing
				if (onSettingsChange && data.result.data) {
					const updatedHabit = {
						...habitWithSettings,
						habits: {
							...habitWithSettings.habits,
							name: data.result.data.name,
							description: data.result.data.description || null,
							category: data.result.data.category,
							icon: data.result.data.icon
						}
					};
					onSettingsChange(updatedHabit);
				}
				onClose();
			} else {
				console.error($errors);
			}
		}
	});

	let selectedCategory = $derived(
		$form.category ? { value: $form.category, label: $form.category.toLowerCase() } : undefined
	);

	let isActive = $state(habitWithSettings.user_habits.active ?? false);
	let isToggling = $state(false);
	let isUpdatingSchedule = $state(false);

	$effect(() => {
		$form = {
			id: habitWithSettings.habits.id,
			name: habitWithSettings.habits.name,
			description: habitWithSettings.habits.description ?? undefined,
			category: habitWithSettings.habits.category as Category,
			icon: habitWithSettings.habits.icon
		};
	});

	async function handleToggleHabitActive(active: boolean) {
		if (!habitWithSettings.user_habits || isToggling) return;

		isToggling = true;
		try {
			const result = await toggleHabitActive(habitWithSettings.user_habits.id, active);

			if (!result.success) {
				console.error('Failed to toggle habit:', result.message);
				// Revert the UI state on failure
				isActive = !active;
			} else {
				isActive = active;
				// Update the local state
				const updatedHabitWithSettings = {
					...habitWithSettings,
					user_habits: {
						...habitWithSettings.user_habits,
						active
					}
				};

				// Notify parent component about the change using callback
				if (onSettingsChange) {
					onSettingsChange(updatedHabitWithSettings);
				}
			}
		} catch (error) {
			console.error('Error in toggle handler:', error);
			// Revert the UI state on error
			isActive = !active;
		} finally {
			isToggling = false;
		}
	}

	// Handle schedule changes
	async function handleScheduleChange(schedules: DaySchedule[]) {
		if (!habitWithSettings.user_habits || isUpdatingSchedule) return;

		isUpdatingSchedule = true;
		try {
			// Call the API to update the schedule
			const result = await updateHabitSchedule(habitWithSettings.user_habits.id, schedules);

			if (!result.success) {
				console.error('Failed to update schedule:', result.message);
			} else {
				// Update the local state
				const updatedHabitWithSettings = {
					...habitWithSettings,
					user_habits: {
						...habitWithSettings.user_habits,
						daily_schedules: schedules
					}
				};

				// Notify parent component about the change using callback
				if (onSettingsChange) {
					onSettingsChange(updatedHabitWithSettings);
				}
			}
		} catch (error) {
			console.error('Error updating schedules:', error);
		} finally {
			isUpdatingSchedule = false;
		}
	}
</script>

<div class="mb-4 flex items-center gap-4">
	<Button variant="ghost" class="p-0 hover:bg-transparent" onclick={onClose}>
		<ChevronLeft class="h-6 w-6" />
	</Button>
	<Card.Title class="text-2xl">{habitWithSettings.habits.name}</Card.Title>
</div>

<div class="grid gap-4">
	<Card.Root>
		<Card.Header>
			<Card.Title class="text-lg">Edit Habit</Card.Title>
		</Card.Header>

		<Card.Content>
			<form class="space-y-6" method="POST" action="?/updateHabit" use:enhance>
				<input type="hidden" name="id" bind:value={$form.id} />
				<div class="space-y-4">
					<div class="space-y-2">
						<Label for="name">Habit Title</Label>
						<Input id="name" name="name" bind:value={$form.name} placeholder="Enter habit title" />
					</div>

					<div class="space-y-2">
						<Label for="description">Description (Optional)</Label>
						<Input
							id="description"
							name="description"
							bind:value={$form.description}
							placeholder="Add a description"
						/>
					</div>

					<div class="space-y-2">
						<Label for="icon">Icon</Label>
						<Input id="icon" name="icon" bind:value={$form.icon} />
					</div>

					<div class="space-y-2">
						<Label for="category">Category</Label>
						<input type="hidden" name="category" bind:value={$form.category} />
						<Select
							selected={selectedCategory}
							onSelectedChange={(e) => ($form.category = e!.value)}
						>
							<SelectTrigger>
								<SelectValue>{$form.category}</SelectValue>
							</SelectTrigger>
							<SelectContent>
								{#each categories as cat}
									<SelectItem value={cat}>{cat}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
					</div>
				</div>

				<div class="flex justify-end pt-4">
					<Button type="submit" disabled={$submitting}>
						{#if $submitting}
							Saving...
						{:else}
							Save Changes
						{/if}
					</Button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Content>
			<div class="flex items-center justify-between">
				<div>
					<p class="font-medium">Active</p>
					<p class="text-muted-foreground text-sm">
						{isActive ? 'This habit is currently active' : 'This habit is currently inactive'}
					</p>
				</div>
				{#if habitWithSettings.user_habits}
					<Switch
						checked={isActive}
						onCheckedChange={(checked: boolean) => handleToggleHabitActive(checked)}
						disabled={isToggling}
					/>
				{:else}
					<p class="text-muted-foreground text-sm italic">
						Save changes first to enable this option
					</p>
				{/if}
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Add the HabitSchedule component -->
	{#if habitWithSettings.user_habits}
		<HabitSchedule
			userHabit={habitWithSettings.user_habits}
			onScheduleChange={handleScheduleChange}
		/>
	{/if}
</div>
