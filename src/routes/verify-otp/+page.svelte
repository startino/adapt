<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	export let data;
	let email = data.email || '';
	let otp = '';
	let isSubmitting = false;
	let isResending = false;
	let message = '';

	async function resendOTP() {
		if (isResending) return;
		isResending = true;
		message = '';

		try {
			if (!email) {
				message = 'Please enter your email address';
				isResending = false;
				return;
			}

			const res = await fetch('/auth?/login', {
				method: 'POST',
				body: new FormData(Object.assign(document.createElement('form'), {
					'email': email,
					'auth_type': 'otp'
				})),
			});
			
			const result = await res.json();
			
			if (result.success) {
				message = 'A new OTP has been sent to your email';
			} else {
				message = result.message || 'Failed to send OTP';
			}
		} catch (error) {
			message = 'An error occurred. Please try again.';
		} finally {
			isResending = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50">
	<div class="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
		<h1 class="mb-6 text-center text-2xl font-bold text-gray-900">Verify OTP</h1>

		{#if message}
			<div class="mb-4 rounded-md bg-blue-50 p-4 text-blue-700">
				{message}
			</div>
		{/if}

		<form method="POST" action="?/verify" use:enhance={() => {
			isSubmitting = true;
			return async ({ result }) => {
				isSubmitting = false;
				if (result.type === 'error') {
					message = result.error.message;
				}
			};
		}}>
			<div class="mb-4">
				<label for="email" class="mb-2 block text-sm font-medium text-gray-700">
					Email address
				</label>
				<input
					type="email"
					id="email"
					name="email"
					bind:value={email}
					required
					class="w-full rounded-md border border-gray-300 p-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
				/>
			</div>

			<div class="mb-6">
				<label for="otp" class="mb-2 block text-sm font-medium text-gray-700">
					Verification Code
				</label>
				<input
					type="text"
					id="otp"
					name="otp"
					bind:value={otp}
					inputmode="numeric"
					pattern="[0-9]*"
					autocomplete="one-time-code"
					required
					class="w-full rounded-md border border-gray-300 p-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
				/>
			</div>

			<button
				type="submit"
				disabled={isSubmitting}
				class="w-full rounded-md bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-70"
			>
				{isSubmitting ? 'Verifying...' : 'Verify Code'}
			</button>
		</form>

		<div class="mt-4 text-center">
			<button
				onclick={resendOTP}
				disabled={isResending}
				class="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-70"
			>
				{isResending ? 'Sending...' : 'Resend Code'}
			</button>
		</div>

		<div class="mt-6 text-center text-sm text-gray-600">
			<a href="/auth" class="text-blue-600 hover:text-blue-800">Back to login</a>
		</div>
	</div>
</div> 