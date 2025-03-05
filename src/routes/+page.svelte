<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { Plus, Settings, Check } from 'lucide-svelte';
	import { supabase } from '$lib/client/supabase';
	import { goto } from '$app/navigation';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();
	let activeTab = $state('Habits');
	let activeCategory = $state('move');
	let isSubmitting = $state<string | null>(null);
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
				<Button size="icon" variant="default" class="rounded-full">
					<Plus class="h-5 w-5" />
				</Button>
			</div>

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
