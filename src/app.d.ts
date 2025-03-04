// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import { SupabaseClient, Session } from '@supabase/supabase-js';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: import('$lib/server/auth').SessionValidationResult['user'];
			session: import('$lib/server/auth').SessionValidationResult['session'];
			supabase: SupabaseClient;
			getSession(): Promise<Session | null>;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		interface Error {
			message: string;
		}
	}
}

export {};
