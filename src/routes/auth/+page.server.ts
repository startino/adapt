import { fail, redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { env } from '$env/dynamic/private';

export const load = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/app');
	}
	if (env.NODE_ENV === 'development' && !event.url.searchParams.has('nobypass')) {
		return redirect(302, '/auth/dev');
	}
};

export const actions = {
	login: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email');

		if (!validateEmail(email)) {
			return fail(400, {
				message: 'Please enter a valid email address'
			});
		}

		try {
			const origin = event.url.origin;
			
			// Send combined authentication (magic link + OTP)
			const { email: userEmail } = await auth.sendCombinedAuth(email, origin);
			
			// Return success response with email for OTP verification if needed
			return {
				success: true,
				message: 'Check your email to sign in',
				email: userEmail
			};
		} catch (e) {
			console.error('Login error:', e);
			return fail(500, { message: 'An error has occurred' });
		}
	}
};

function validateEmail(email: unknown): email is string {
	return (
		typeof email === 'string' &&
		email.length > 0 &&
		email.length <= 255 &&
		/^[^@]+@[^@]+\.[^@]+$/.test(email)
	);
}
