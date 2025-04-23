// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import { SupabaseClient, Session } from '@supabase/supabase-js';
import { Database } from '$lib/types/database.types';
import Stripe from 'stripe';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient<Database>;
			session: Session | null;
			getSession: () => Promise<Session | null>;
			stripe: Stripe | null;
			subscriptionStatus: {
				isActive: boolean;
				planId?: string;
				planName?: string;
				currentPeriodEnd?: string;
				isInTrial?: boolean;
				trialEnd?: string;
				isAnonymous?: boolean;
			};
			isTrialEligible: boolean;
			hasExpiredTrial: boolean;
			isAnonymous: boolean;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
