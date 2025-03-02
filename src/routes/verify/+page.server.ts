import { error, redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';

export const load = async (event) => {
	const token = event.url.searchParams.get('token');

	if (!token) {
		return {
			error: 'Missing verification token',
			success: false
		};
	}

	try {
		const { user, valid } = await auth.validateVerificationToken(token);

		if (!valid || !user) {
			return error(401, 'Invalid or expired verification token');
		}

		// Create a session for the user
		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, user.id);
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} catch (e) {
		console.error('Verification error:', e);
		return error(500, 'An error occurred during verification');
	}

	throw redirect(302, '/app'); // Redirect to home page or dashboard
};

