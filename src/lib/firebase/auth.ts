import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { isAllowlistedAdmin, type AdminRole } from '@/config/admins';
import { getFirebaseAuth, getFirebaseDb } from '@/lib/firebase/client';

export async function resolveAdminRole(user: User): Promise<AdminRole | null> {
  if (isAllowlistedAdmin(user.email)) {
    return 'super_admin';
  }

  const roleSnap = await getDoc(doc(getFirebaseDb(), 'roles', user.uid));
  const role = roleSnap.data()?.role;
  if (role === 'super_admin' || role === 'content_manager') {
    return role;
  }

  return null;
}

export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(getFirebaseAuth(), provider);
  return result.user;
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const auth = getFirebaseAuth();
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
    if (code === 'auth/user-not-found' && isAllowlistedAdmin(email)) {
      const created = await createUserWithEmailAndPassword(auth, email, password);
      return created.user;
    }
    throw error;
  }
}

export async function signOutAdmin(): Promise<void> {
  await signOut(getFirebaseAuth());
}
