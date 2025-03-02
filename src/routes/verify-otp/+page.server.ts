import { error, redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';

export const load = async (event) => {
	// If user is already logged in, redirect to app
	if (event.locals.user) {
		return redirect(302, '/app');
	}

	// Get email from query params for prefilling
	const email = event.url.searchParams.get('email');
	
	return { email };
};

export const actions = {
	verify: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email');
		const otp = formData.get('otp');

		if (!email || typeof email !== 'string') {
			return error(400, 'Email is required');
		}

		if (!otp || typeof otp !== 'string') {
			return error(400, 'OTP is required');
		}

		try {
			const { user, valid } = await auth.validateOTP(email, otp);

			if (!valid || !user) {
				return error(401, 'Invalid or expired OTP');
			}

			// Create a session for the user
			const sessionToken = auth.generateSessionToken();
			const session = await auth.createSession(sessionToken, user.id);
			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

			return redirect(302, '/app');
		} catch (e) {
			console.error('OTP verification error:', e);
			return error(500, 'An error occurred during verification');
		}
	}
}; 