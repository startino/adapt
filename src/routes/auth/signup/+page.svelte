<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import { zod } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Loader2 } from 'lucide-svelte';

	let { data } = $props();
	let isSubmitting = $state(false);

	const schema = z
		.object({
			email: z.string().email(),
			password: z.string().min(6),
			confirmPassword: z.string().min(6)
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: "Passwords don't match",
			path: ['confirmPassword']
		});

	const { form, errors, enhance } = superForm(data.form, {
		validators: zod(schema),
		onSubmit: () => {
			isSubmitting = true;
		},
		onResult: ({ result }) => {
			isSubmitting = false;
			if (result.type === 'error') {
				$errors.email = [result.error?.message || 'An error occurred'];
			}
		}
	});

	$effect(() => {
		if (isSubmitting) {
			const timer = setTimeout(() => (isSubmitting = false), 5000); // 5s timeout
			return () => clearTimeout(timer);
		}
	});
</script>

<div class="container flex h-screen w-screen flex-col items-center justify-center">
	<Card class="w-[350px]">
		<CardHeader>
			<CardTitle>Sign Up</CardTitle>
			<CardDescription>Create a new account to get started.</CardDescription>
		</CardHeader>
		<form method="POST" use:enhance>
			<CardContent class="grid gap-4">
				<div class="grid gap-2">
					<Label for="email">Email</Label>
					<Input
						id="email"
						type="email"
						name="email"
						bind:value={$form.email}
						placeholder="name@example.com"
						disabled={isSubmitting}
					/>
					{#if $errors.email}
						<p class="text-sm text-red-500">{$errors.email[0]}</p>
					{/if}
				</div>
				<div class="grid gap-2">
					<Label for="password">Password</Label>
					<Input
						id="password"
						type="password"
						name="password"
						bind:value={$form.password}
						placeholder="Create a password"
						disabled={isSubmitting}
					/>
					{#if $errors.password}
						<p class="text-sm text-red-500">{$errors.password[0]}</p>
					{/if}
				</div>
				<div class="grid gap-2">
					<Label for="confirmPassword">Confirm Password</Label>
					<Input
						id="confirmPassword"
						type="password"
						name="confirmPassword"
						bind:value={$form.confirmPassword}
						placeholder="Confirm your password"
						disabled={isSubmitting}
					/>
					{#if $errors.confirmPassword}
						<p class="text-sm text-red-500">{$errors.confirmPassword[0]}</p>
					{/if}
				</div>
			</CardContent>
			<CardFooter class="flex flex-col gap-4">
				<Button type="submit" class="w-full" disabled={isSubmitting}>
					{#if isSubmitting}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{/if}
					Sign Up
				</Button>
				<p class="text-muted-foreground text-center text-sm">
					Already have an account? <a href="/auth/login" class="text-primary hover:underline"
						>Login</a
					>
				</p>
			</CardFooter>
		</form>
	</Card>
</div>
