<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
	let isEmailSent = $state(false);
	let email = $state('');
</script>

<div class="flex min-h-screen items-center justify-center">
	<div class="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-md">
		<h1 class="mb-6 text-2xl font-bold text-gray-800">Sign In</h1>

		{#if form?.success || isEmailSent}
			<div class="rounded-md bg-green-50 p-4 text-green-700">
				<h2 class="mb-2 text-lg font-semibold">Check Your Email</h2>
				<p>We've sent you an email with instructions to sign in.</p>
				<p class="mt-2">You can either:</p>
				<ul class="list-disc ml-5 mt-2">
					<li>Click the login link in the email</li>
					<li>
						<a href={`/verify-otp?email=${encodeURIComponent(form?.email || email)}`} class="text-blue-600 hover:text-blue-800">
							Enter the verification code
						</a> from the email
					</li>
				</ul>
			</div>
		{:else}
			<form
				method="post"
				action="?/login"
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							isEmailSent = true;
						}
					};
				}}
				class="space-y-6"
			>
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
					<input
						id="email"
						name="email"
						type="email"
						bind:value={email}
						required
						autocomplete="email"
						class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
					/>
				</div>

				{#if form?.message}
					<div class="rounded-md bg-red-50 p-4 text-red-700">
						<p>{form.message}</p>
					</div>
				{/if}

				<button
					type="submit"
					class="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
				>
					Send sign in link
				</button>
			</form>
		{/if}
	</div>
</div>
