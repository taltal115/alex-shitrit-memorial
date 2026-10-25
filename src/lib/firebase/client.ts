import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getFirebaseWebConfig } from '@/lib/firebase/config';

function getFirebaseApp(): FirebaseApp {
  const config = getFirebaseWebConfig();
  if (!config) {
    throw new Error('Firebase is not configured');
  }

  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp(config);
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

export function getFirebaseDb(): Firestore {
  return getFirestore(getFirebaseApp());
}

export function getFirebaseStorage(): FirebaseStorage {
  return getStorage(getFirebaseApp());
}
