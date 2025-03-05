<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Plus, Settings, Check } from 'lucide-svelte';
	import { supabase } from '$lib/client/supabase';
	import { goto } from '$app/navigation';
	import { invalidateAll } from '$app/navigation';
	import { superForm } from 'sveltekit-superforms/client';
	import { zod } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';
	import * as Select from '$lib/components/ui/select';

	let { data } = $props();
	let activeTab = $state('Habits');
	let activeCategory = $state('move');
	let isSubmitting = $state<string | null>(null);
	let showNewHabitDialog = $state(false);

	const habitSchema = z.object({
		name: z.string().min(1, 'Name is required'),
		description: z.string().optional(),
		category: z.enum(['move', 'eat', 'sleep', 'mind']),
		icon: z.string().min(1, 'Icon is required')
	});

	const { form, errors, enhance } = superForm(data.form, {
		validators: zod(habitSchema),
		onSubmit: () => {
			isSubmitting = 'new';
		},
		onResult: ({ result }) => {
			isSubmitting = null;
			if (result.type === 'success') {
				showNewHabitDialog = false;
			}
		}
	});

	let selectedCategory = $derived<{ value: 'move' | 'eat' | 'sleep' | 'mind'; label: string }>(
		$form.category
			? {
					value: $form.category,
					label: $form.category
				}
			: {
					value: 'move',
					label: 'move'
				}
	);

	$inspect(data.habits.filter((h) => h.category === activeCategory));
	async function handleLogout() {
		await supabase.auth.signOut();
		goto('/auth/login');
	}

	async function handleComplete(habitId: string) {
		if (isSubmitting === habitId) return;
		isSubmitting = habitId;

		try {
			const response = await fetch(`/api/habits/${habitId}/complete`, {
				method: 'POST'
			});

			if (!response.ok) {
				throw new Error('Failed to complete habit');
			}

			await invalidateAll();
		} catch (error) {
			console.error('Error completing habit:', error);
		} finally {
			isSubmitting = null;
		}
	}
</script>

<div class="container mx-auto p-4">
	<div class="mb-8 flex items-center justify-between">
		<div class="flex items-center gap-4">
			<Avatar.Root>
				<Avatar.Image src={null} alt={data.user.email} />
				<Avatar.Fallback class="bg-primary text-primary-foreground">
					{data.user.email?.[0].toUpperCase() ?? 'N'}
				</Avatar.Fallback>
			</Avatar.Root>
			<div>
				<h1 class="text-2xl font-semibold">ADAPT</h1>
			</div>
		</div>
		<Button variant="ghost" size="icon" onclick={handleLogout}>
			<Settings class="h-5 w-5" />
		</Button>
	</div>

	<Tabs.Root bind:value={activeTab} class="w-full">
		<Tabs.List class="bg-card w-full justify-start rounded-full p-1">
			<Tabs.Trigger value="Goal">Goal</Tabs.Trigger>
			<Tabs.Trigger value="Plan">Plan</Tabs.Trigger>
			<Tabs.Trigger value="Habits">Habits</Tabs.Trigger>
		</Tabs.List>
	</Tabs.Root>

	{#if activeTab === 'Habits'}
		<div class="mt-6">
			<div class="flex items-center justify-between">
				<div class="flex gap-2">
					<Button
						variant={activeCategory === 'eat' ? 'default' : 'outline'}
						onclick={() => (activeCategory = 'eat')}
						class="rounded-full"
					>
						eat
					</Button>
					<Button
						variant={activeCategory === 'move' ? 'default' : 'outline'}
						onclick={() => (activeCategory = 'move')}
						class="rounded-full"
					>
						move
					</Button>
					<Button
						variant={activeCategory === 'sleep' ? 'default' : 'outline'}
						onclick={() => (activeCategory = 'sleep')}
						class="rounded-full"
					>
						sleep
					</Button>
					<Button
						variant={activeCategory === 'mind' ? 'default' : 'outline'}
						onclick={() => (activeCategory = 'mind')}
						class="rounded-full"
					>
						mind
					</Button>
				</div>
				<Button
					size="icon"
					variant="default"
					class="rounded-full"
					onclick={() => (showNewHabitDialog = true)}
				>
					<Plus class="h-5 w-5" />
				</Button>
			</div>

			<Dialog.Root bind:open={showNewHabitDialog}>
				<Dialog.Content class="sm:max-w-[425px]">
					<Dialog.Header>
						<Dialog.Title>Create New Habit</Dialog.Title>
						<Dialog.Description>
							Add a new habit to track. Fill in the details below.
						</Dialog.Description>
					</Dialog.Header>
					<form method="POST" action="?/createHabit" use:enhance>
						<div class="grid gap-4 py-4">
							<div class="grid gap-2">
								<Label for="name">Name</Label>
								<Input
									id="name"
									name="name"
									bind:value={$form.name}
									placeholder="Enter habit name"
								/>
								{#if $errors.name}
									<p class="text-destructive text-sm">{$errors.name[0]}</p>
								{/if}
							</div>
							<div class="grid gap-2">
								<Label for="description">Description</Label>
								<Textarea
									id="description"
									name="description"
									bind:value={$form.description}
									placeholder="Enter habit description"
								/>
								{#if $errors.description}
									<p class="text-destructive text-sm">{$errors.description[0]}</p>
								{/if}
							</div>
							<div class="grid gap-2">
								<Label for="category">Category</Label>
								<input type="hidden" name="category" bind:value={$form.category} />
								<Select.Root
									selected={selectedCategory}
									onSelectedChange={(e) => ($form.category = e!.value)}
								>
									<Select.Trigger class="w-full">
										<Select.Value placeholder="Select a category" />
									</Select.Trigger>
									<Select.Content>
										<Select.Item value="move">move</Select.Item>
										<Select.Item value="eat">eat</Select.Item>
										<Select.Item value="sleep">sleep</Select.Item>
										<Select.Item value="mind">mind</Select.Item>
									</Select.Content>
								</Select.Root>
								{#if $errors.category}
									<p class="text-destructive text-sm">{$errors.category[0]}</p>
								{/if}
							</div>
							<div class="grid gap-2">
								<Label for="icon">Icon</Label>
								<Input
									id="icon"
									name="icon"
									bind:value={$form.icon}
									placeholder="Enter emoji icon"
								/>
								{#if $errors.icon}
									<p class="text-destructive text-sm">{$errors.icon[0]}</p>
								{/if}
							</div>
						</div>
						<Dialog.Footer>
							<Button type="button" variant="outline" onclick={() => (showNewHabitDialog = false)}>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting === 'new'}>
								{#if isSubmitting === 'new'}
									<span class="mr-2 animate-spin">◌</span>
								{/if}
								Create Habit
							</Button>
						</Dialog.Footer>
					</form>
				</Dialog.Content>
			</Dialog.Root>

			<div class="mt-6">
				<p class="mb-4 text-lg">Select your habits below, or add your own with the plus</p>
				<div class="space-y-4">
					{#each data.habits.filter((h) => h.category === activeCategory) as habit}
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
									<Button variant="ghost" size="icon">
										<Settings class="h-5 w-5" />
									</Button>
								</div>
							</Card.Content>
						</Card.Root>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>
