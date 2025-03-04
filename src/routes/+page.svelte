<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { supabase } from '$lib/client/supabase';
	import { goto } from '$app/navigation';

	let { data } = $props();

	async function handleLogout() {
		await supabase.auth.signOut();
		goto('/auth/login');
	}
</script>

<div class="container mx-auto p-4">
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Welcome, {data.user.email}</h1>
			<p class="text-muted-foreground">Track your habits and build consistency</p>
		</div>
		<Button variant="outline" onclick={handleLogout}>Logout</Button>
	</div>

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
		<Card>
			<CardHeader>
				<CardTitle>Daily Habits</CardTitle>
				<CardDescription>Track your daily habits and build consistency</CardDescription>
			</CardHeader>
			<CardContent>
				<p>View and manage your daily habits</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Analytics</CardTitle>
				<CardDescription>Monitor your progress and achievements</CardDescription>
			</CardHeader>
			<CardContent>
				<p>Check your habit completion rates and trends</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Settings</CardTitle>
				<CardDescription>Customize your experience</CardDescription>
			</CardHeader>
			<CardContent>
				<p>Adjust your preferences and account settings</p>
			</CardContent>
		</Card>
	</div>
</div>
