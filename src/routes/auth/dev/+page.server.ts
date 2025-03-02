import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { env } from '$env/dynamic/private';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async (event) => {
  // Only allow in development mode
  if (env.NODE_ENV === 'production') {
    throw redirect(302, '/');
  }
  
  // If already logged in, redirect to home
  if (event.locals.user) {
    throw redirect(302, '/');
  }
  
  return {};
};

export const actions: Actions = {
  login: async (event) => {
    // Only allow in development mode
    if (env.NODE_ENV === 'production') {
      throw redirect(302, '/');
    }

    const formData = await event.request.formData();
    const email = formData.get('email')?.toString();

    if (!email) {
      return { error: 'Email is required' };
    }

    // Find or create user
    let user = await auth.findUserByEmail(email);
    if (!user) {
      const userId = await auth.createUser(email);
      user = await auth.findUserByEmail(email);
      
      // Mark email as verified directly
      await db.update(table.user)
        .set({ emailVerified: new Date() })
        .where(eq(table.user.id, user.id));
    } else if (!user.emailVerified) {
      // If user exists but email not verified, verify it
      await db.update(table.user)
        .set({ emailVerified: new Date() })
        .where(eq(table.user.id, user.id));
    }

    // Create session directly without email verification
    const sessionToken = auth.generateSessionToken();
    const session = await auth.createSession(sessionToken, user.id);
    auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

    throw redirect(302, '/');
  }
} 