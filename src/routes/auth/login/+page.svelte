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

	let { data } = $props();

	const schema = z.object({
		email: z.string().email(),
		password: z.string().min(6)
	});

	const { form, errors, enhance } = superForm(data.form, {
		validators: zod(schema),
		onResult: ({ result }) => {
			if (result.type === 'error') {
				$errors.email = [result.error?.message || 'An error occurred'];
			}
		}
	});
</script>

<div class="container flex h-screen w-screen flex-col items-center justify-center">
	<Card class="w-[350px]">
		<CardHeader>
			<CardTitle>Login</CardTitle>
			<CardDescription>Enter your email and password to login to your account.</CardDescription>
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
						placeholder="Enter your password"
					/>
					{#if $errors.password}
						<p class="text-sm text-red-500">{$errors.password[0]}</p>
					{/if}
				</div>
			</CardContent>
			<CardFooter>
				<Button type="submit" class="w-full">Login</Button>
			</CardFooter>
		</form>
	</Card>
</div>
