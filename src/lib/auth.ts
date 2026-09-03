import { cookies } from 'next/headers';
import { prisma } from './prisma';

export const AUTH_COOKIE_NAME = 'mediloop_session_user';

export async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const sessionEmail = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!sessionEmail) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { email: sessionEmail.toLowerCase().trim() },
      include: {
        facility: true,
      },
    });

    return user;
  } catch (err) {
    console.error('Error fetching current user:', err);
    return null;
  }
}

export async function setSessionUser(email: string) {
  const cookieStore = cookies();
  cookieStore.set(AUTH_COOKIE_NAME, email.toLowerCase().trim(), {
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
    sameSite: 'lax',
  });
}

export async function clearSessionUser() {
  const cookieStore = cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}
