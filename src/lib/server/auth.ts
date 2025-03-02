import type { RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import { ulid } from 'ulid';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { env } from '$env/dynamic/private';
import { sendVerificationEmail, sendOTPEmail, sendCombinedAuthEmail } from './email';

const DAY_IN_MS = 1000 * 60 * 60 * 24;
const OTP_EXPIRY_MS = 1000 * 60 * 10; // 10 minutes

export const sessionCookieName = 'auth-session';

export function generateToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	const token = encodeBase64url(bytes);
	return token;
}

export function generateOTP(length = 6) {
	return Array.from(
		{ length },
		() => Math.floor(Math.random() * 10).toString()
	).join('');
}

export function generateSessionToken() {
	return generateToken();
}

export async function createUser(email: string) {
	const userId = ulid();
	await db.insert(table.user).values({
		id: userId,
		email,
		emailVerified: null
	});
	return userId;
}

export async function findUserByEmail(email: string) {
	const [user] = await db
		.select()
		.from(table.user)
		.where(eq(table.user.email, email));
	return user || null;
}

export async function createVerificationToken(userId: string) {
	const token = generateToken();
	const tokenId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	
	// Delete any existing tokens for this user
	await db
		.delete(table.verificationToken)
		.where(eq(table.verificationToken.userId, userId));
	
	// Create new token (expires in 24 hours)
	await db.insert(table.verificationToken).values({
		id: tokenId,
		token,
		userId,
		expiresAt: new Date(Date.now() + DAY_IN_MS)
	});
	
	return token;
}

export async function createOTP(userId: string) {
	const code = generateOTP();
	const otpId = encodeHexLowerCase(sha256(new TextEncoder().encode(`${userId}:${code}`)));
	
	// Delete any existing OTPs for this user
	await db
		.delete(table.otp)
		.where(eq(table.otp.userId, userId));
	
	// Create new OTP (expires in 10 minutes)
	await db.insert(table.otp).values({
		id: otpId,
		code,
		userId,
		expiresAt: new Date(Date.now() + OTP_EXPIRY_MS)
	});
	
	return code;
}

export async function validateVerificationToken(token: string) {
	const tokenId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	
	const [result] = await db
		.select({
			token: table.verificationToken,
			user: table.user
		})
		.from(table.verificationToken)
		.innerJoin(table.user, eq(table.verificationToken.userId, table.user.id))
		.where(eq(table.verificationToken.id, tokenId));
	
	if (!result) {
		return { user: null, valid: false };
	}
	
	const { token: verificationToken, user } = result;
	
	// Check if token is expired
	if (Date.now() >= verificationToken.expiresAt.getTime()) {
		await db.delete(table.verificationToken).where(eq(table.verificationToken.id, tokenId));
		return { user: null, valid: false };
	}
	
	// Token is valid, mark email as verified
	await db
		.update(table.user)
		.set({ emailVerified: new Date() })
		.where(eq(table.user.id, user.id));
	
	// Delete the used token
	await db.delete(table.verificationToken).where(eq(table.verificationToken.id, tokenId));
	
	return { user, valid: true };
}

export async function validateOTP(email: string, code: string) {
	const user = await findUserByEmail(email);
	
	if (!user) {
		return { user: null, valid: false };
	}
	
	const [otpRecord] = await db
		.select()
		.from(table.otp)
		.where(eq(table.otp.userId, user.id));
	
	if (!otpRecord) {
		return { user: null, valid: false };
	}
	
	// Check if OTP code matches
	if (otpRecord.code !== code) {
		return { user: null, valid: false };
	}
	
	// Check if OTP is expired
	if (Date.now() >= otpRecord.expiresAt.getTime()) {
		await db.delete(table.otp).where(eq(table.otp.id, otpRecord.id));
		return { user: null, valid: false };
	}
	
	// OTP is valid, mark email as verified
	await db
		.update(table.user)
		.set({ emailVerified: new Date() })
		.where(eq(table.user.id, user.id));
	
	// Delete the used OTP
	await db.delete(table.otp).where(eq(table.otp.id, otpRecord.id));
	
	return { user, valid: true };
}

export async function sendMagicLink(email: string, origin: string) {
	let user = await findUserByEmail(email);
	let isNewUser = false;
	
	// Create user if not exists
	if (!user) {
		const userId = await createUser(email);
		user = await findUserByEmail(email);
		isNewUser = true;
	}
	
	// Create verification token
	const token = await createVerificationToken(user.id);
	
	// Send verification email
	await sendVerificationEmail(email, token, origin);
	
	return { isNewUser };
}

export async function sendOTP(email: string, origin: string) {
	let user = await findUserByEmail(email);
	let isNewUser = false;
	
	// Create user if not exists
	if (!user) {
		const userId = await createUser(email);
		user = await findUserByEmail(email);
		isNewUser = true;
	}
	
	// Create OTP
	const otpCode = await createOTP(user.id);
	
	// Send OTP email
	await sendOTPEmail(email, otpCode);
	
	return { isNewUser };
}

export async function sendCombinedAuth(email: string, origin: string) {
	let user = await findUserByEmail(email);
	let isNewUser = false;
	
	// Create user if not exists
	if (!user) {
		const userId = await createUser(email);
		user = await findUserByEmail(email);
		isNewUser = true;
	}
	
	// Create verification token for magic link
	const token = await createVerificationToken(user.id);
	
	// Create OTP
	const otpCode = await createOTP(user.id);
	
	// Send combined email with both authentication options
	await sendCombinedAuthEmail(email, token, otpCode, origin);
	
	return { isNewUser, email };
}

export async function createSession(token: string, userId: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: table.Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + DAY_IN_MS * 30)
	};
	await db.insert(table.session).values(session);
	return session;
}

export async function validateSessionToken(token: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const [result] = await db
		.select({
			// Adjust user table here to tweak returned data
			user: { id: table.user.id, email: table.user.email, name: table.user.name },
			session: table.session
		})
		.from(table.session)
		.innerJoin(table.user, eq(table.session.userId, table.user.id))
		.where(eq(table.session.id, sessionId));

	if (!result) {
		return { session: null, user: null };
	}
	const { session, user } = result;

	const sessionExpired = Date.now() >= session.expiresAt.getTime();
	if (sessionExpired) {
		await db.delete(table.session).where(eq(table.session.id, session.id));
		return { session: null, user: null };
	}

	const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15;
	if (renewSession) {
		session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30);
		await db
			.update(table.session)
			.set({ expiresAt: session.expiresAt })
			.where(eq(table.session.id, session.id));
	}
	
	return { session, user };
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

export async function invalidateSession(sessionId: string) {
	await db.delete(table.session).where(eq(table.session.id, sessionId));
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: '/',
		secure: env.NODE_ENV === 'production'
	});
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, {
		path: '/',
		secure: env.NODE_ENV === 'production'
	});
}
