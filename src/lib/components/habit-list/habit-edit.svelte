<script lang="ts">
	import type { Habit } from '$lib/server/db/schema';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
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

	type Props = {
		form: SuperValidated<z.infer<typeof updateHabitSchema>>;
		onClose: () => void;
		habit: Habit;
	};

	let { form: validatedForm, onClose, habit }: Props = $props();
	const { form, enhance, submitting, errors } = superForm(validatedForm, {
		id: 'habit-edit-' + habit.id,
		validators: zod(updateHabitSchema),
		dataType: 'json',
		onResult: (data) => {
			if (data.result.type === 'success') {
				onClose();
			} else {
				console.error($errors);
			}
		}
	});

	let selectedCategory = $derived(
		$form.category ? { value: $form.category, label: $form.category.toLowerCase() } : undefined
	);

	$effect(() => {
		$form = {
			id: habit.id,
			name: habit.name,
			description: habit.description ?? undefined,
			category: habit.category as Category,
			icon: habit.icon
		};
	});

	function updateCategory(cat: Category) {
		$form.category = cat;
	}
</script>

<div class="mb-4 flex items-center gap-4">
	<Button variant="ghost" class="p-0 hover:bg-transparent" onclick={onClose}>
		<ChevronLeft class="h-6 w-6" />
	</Button>
	<Card.Title class="text-2xl">{habit.name}</Card.Title>
</div>

<Card.Root class="w-full">
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
					<Select selected={selectedCategory} onSelectedChange={(e) => ($form.category = e!.value)}>
						<SelectTrigger>
							<SelectValue>{$form.category}</SelectValue>
						</SelectTrigger>
						<SelectContent>
							{#each categories as cat}
								<SelectItem value={cat}>{cat.toLocaleUpperCase()}</SelectItem>
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
