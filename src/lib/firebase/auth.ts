import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { isAllowlistedAdmin, type AdminRole } from '@/config/admins';
import { getFirebaseAuth, getFirebaseDb } from '@/lib/firebase/client';

function asRole(value: unknown): AdminRole | null {
  return value === 'super_admin' || value === 'content_manager' ? value : null;
}

async function ensureAllowlistedProfile(user: User): Promise<void> {
  await setDoc(
    doc(getFirebaseDb(), 'roles', user.uid),
    {
      email: user.email?.toLowerCase() ?? '',
      displayName: user.displayName ?? '',
      role: 'super_admin',
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

async function claimInvite(user: User): Promise<AdminRole | null> {
  const email = user.email?.toLowerCase();
  if (!email) return null;

  const inviteRef = doc(getFirebaseDb(), 'adminInvites', email);
  const inviteSnap = await getDoc(inviteRef);
  const role = asRole(inviteSnap.data()?.role);
  if (!role) return null;

  await setDoc(doc(getFirebaseDb(), 'roles', user.uid), {
    email,
    displayName: user.displayName ?? '',
    role,
    updatedAt: new Date().toISOString(),
  });
  await deleteDoc(inviteRef);
  return role;
}

export async function resolveAdminRole(user: User): Promise<AdminRole | null> {
  if (isAllowlistedAdmin(user.email)) {
    try {
      await ensureAllowlistedProfile(user);
    } catch (error) {
      console.error('Could not save admin profile', error);
    }
    return 'super_admin';
  }

  const roleSnap = await getDoc(doc(getFirebaseDb(), 'roles', user.uid));
  const existing = asRole(roleSnap.data()?.role);
  if (existing) return existing;

  try {
    return await claimInvite(user);
  } catch (error) {
    console.error('Could not claim admin invite', error);
    return null;
  }
}

export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(getFirebaseAuth(), provider);
  return result.user;
}

function authErrorCode(error: unknown): string {
  return typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const auth = getFirebaseAuth();
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    const code = authErrorCode(error);
    const missingUser =
      code === 'auth/user-not-found' || code === 'auth/invalid-credential';
    if (missingUser && isAllowlistedAdmin(email)) {
      try {
        const created = await createUserWithEmailAndPassword(auth, email, password);
        return created.user;
      } catch (createError) {
        if (authErrorCode(createError) === 'auth/email-already-in-use') {
          throw error;
        }
        throw createError;
      }
    }
    throw error;
  }
}

export async function signOutAdmin(): Promise<void> {
  await signOut(getFirebaseAuth());
}
