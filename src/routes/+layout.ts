import { createSupabaseBrowserClient } from '$lib/supabase';
import { signInAnonymously } from '$lib/supabase/auth';
import { browser } from '$app/environment';

export const load = async ({ data, depends, url }) => {
	depends('supabase:auth');
	depends('subscription:status');

	const supabase = createSupabaseBrowserClient();

	const {
		data: { session }
	} = await supabase.auth.getSession();

	// Add a loading state that can be passed to the layout
	let isSigningInAnonymously = false;

	// Handle missing session in browser by auto-signing in anonymously
	if (browser && !session) {
		// Skip auto-sign-in for auth routes (login, signup, etc.)
		const isAuthRoute =
			url.pathname.startsWith('/login') ||
			url.pathname.startsWith('/signup') ||
			url.pathname.startsWith('/auth/') ||
			url.pathname.startsWith('/forgot-password') ||
			url.pathname.startsWith('/reset-password');

		if (!isAuthRoute) {
			console.log('No session found, signing in anonymously...');

			// Set loading state immediately
			isSigningInAnonymously = true;

			try {
				const { session: anonSession, error } = await signInAnonymously();

				if (error) {
					console.error('Error signing in anonymously:', error);
					// Keep isSigningInAnonymously true so UI can show appropriate message
				} else if (anonSession) {
					console.log('Successfully signed in anonymously');

					// Return data for the time before the refresh happens
					return {
						supabase,
						session: anonSession,
						subscriptionStatus: data.subscriptionStatus,
						isAnonymous: true,
						isSigningInAnonymously: true,
						hasExpiredTrial: data.hasExpiredTrial,
						isTrialEligible: data.isTrialEligible
					};
				}
			} catch (err) {
				console.error('Failed to sign in anonymously:', err);
				// Don't reset isSigningInAnonymously here - let layout handle timing
			}
		}
	}

	// Pass the anonymous flag from server to client
	const isAnonymous = data.isAnonymous || false;

	return {
		supabase,
		session: session || data.session,
		subscriptionStatus: data.subscriptionStatus,
		isTrialEligible: data.isTrialEligible,
		hasExpiredTrial: data.hasExpiredTrial,
		isAnonymous,
		isSigningInAnonymously
	};
};
