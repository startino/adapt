<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Plus, Settings, Loader2 } from 'lucide-svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import { zod } from 'sveltekit-superforms/adapters';
	import * as Tabs from '$lib/components/ui/tabs';
	import HabitList from '$lib/components/habit-list/habit-list.svelte';
	import { habitSchema } from '$lib/schemas';
	import { categories, type Category } from '$lib/contants';

	let { data } = $props();
	let activeTab = $state('Habits');
	let activeCategory: Category = $state('move');
	let showNewHabitDialog = $state(false);

	const { form, errors, enhance, submitting } = superForm(data.habitForm, {
		validators: zod(habitSchema),
		onResult: ({ result }) => {
			if (result.type === 'success') {
				showNewHabitDialog = false;
			}
		}
	});
	let selectedCategory = $derived(
		$form.category ? { value: $form.category, label: $form.category.toLowerCase() } : undefined
	);
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
	</div>

	{#if activeTab === 'Habits'}
		<div class="mt-6">
			<div class="flex items-center justify-between">
				<div class="flex gap-2">
					{#each categories as category}
						<Button
							variant={activeCategory === category ? 'default' : 'outline'}
							class="rounded-full"
							onclick={() => (activeCategory = category)}
						>
							{category}
						</Button>
					{/each}
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
										{#each categories as category}
											<Select.Item value={category}>{category.toLowerCase()}</Select.Item>
										{/each}
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
							<Button type="submit" disabled={$submitting}>
								{#if $submitting}
									<Loader2 class="mr-2 h-4 w-4 animate-spin" />
									Creating...
								{:else}
									Create Habit
								{/if}
							</Button>
						</Dialog.Footer>
					</form>
				</Dialog.Content>
			</Dialog.Root>

			<div class="mt-6">
				<p class="mb-4 text-lg">Select your habits below, or add your own with the plus</p>
				<HabitList
					habitsWithSettings={data.habitsWithSettings}
					{activeCategory}
					form={data.updateHabitForm}
				/>
			</div>
		</div>
	{/if}
</div>
