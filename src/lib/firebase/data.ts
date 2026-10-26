import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { sephardiPrayerSections } from '@/data/sephardi-prayers';
import { getFirebaseAuth, getFirebaseDb } from '@/lib/firebase/client';
import { writeAudit } from '@/lib/firebase/cms';

export const MEMORIAL_DOC_ID = 'alex';

export interface MemorialRecord {
  id: string;
  gregorian_death_date: string;
  death_time_relative_to_sunset: 'pending' | 'before_sunset' | 'after_sunset';
  death_date_verified: boolean;
  hebrew_death_date_day: number | null;
  hebrew_death_date_month: string | null;
  hebrew_death_date_year: number | null;
  hebrew_date_before_sunset_day: number;
  hebrew_date_before_sunset_month: string;
  hebrew_date_before_sunset_year: number;
  hebrew_date_after_sunset_day: number;
  hebrew_date_after_sunset_month: string;
  hebrew_date_after_sunset_year: number;
  death_date_verified_at: string | null;
  death_date_verified_by: string | null;
  birth_year: number;
  hebrew_name: string;
  english_name: string;
}

export interface PrayerRecord {
  id: string;
  section_id: string;
  section_order: number;
  title: string;
  hebrew_text: string;
  notes: string | null;
  source_url: string | null;
  verses: string[] | null;
  verification_status: 'pending_family_verification' | 'verified' | 'rejected';
  is_verified: boolean;
  verified_at: string | null;
  verified_by: string | null;
}

export const defaultMemorial: MemorialRecord = {
  id: MEMORIAL_DOC_ID,
  gregorian_death_date: '2020-10-27',
  death_time_relative_to_sunset: 'before_sunset',
  death_date_verified: true,
  hebrew_death_date_day: 9,
  hebrew_death_date_month: 'Cheshvan',
  hebrew_death_date_year: 5781,
  hebrew_date_before_sunset_day: 9,
  hebrew_date_before_sunset_month: 'Cheshvan',
  hebrew_date_before_sunset_year: 5781,
  hebrew_date_after_sunset_day: 10,
  hebrew_date_after_sunset_month: 'Cheshvan',
  hebrew_date_after_sunset_year: 5781,
  death_date_verified_at: null,
  death_date_verified_by: null,
  birth_year: 1950,
  hebrew_name: 'אלכס שטרית בן פורטונה ומכלוף ז״ל',
  english_name: 'Alex Shitrit',
};

function memorialFromData(id: string, data: Record<string, unknown>): MemorialRecord {
  return {
    ...defaultMemorial,
    ...data,
    id,
    death_date_verified_at:
      typeof data.death_date_verified_at === 'string' ? data.death_date_verified_at : null,
    death_date_verified_by:
      typeof data.death_date_verified_by === 'string' ? data.death_date_verified_by : null,
  };
}

export async function getMemorial(): Promise<MemorialRecord> {
  const snap = await getDoc(doc(getFirebaseDb(), 'memorial', MEMORIAL_DOC_ID));
  if (!snap.exists()) {
    return defaultMemorial;
  }
  return memorialFromData(snap.id, snap.data());
}

export async function verifyMemorialDeathDate(
  choice: 'before_sunset' | 'after_sunset',
  memorial: MemorialRecord
): Promise<void> {
  const user = getFirebaseAuth().currentUser;
  if (!user) {
    throw new Error('Not authenticated');
  }

  const before = choice === 'before_sunset';
  const verifiedAt = new Date().toISOString();
  const update = {
    death_time_relative_to_sunset: choice,
    hebrew_death_date_day: before
      ? memorial.hebrew_date_before_sunset_day
      : memorial.hebrew_date_after_sunset_day,
    hebrew_death_date_month: before
      ? memorial.hebrew_date_before_sunset_month
      : memorial.hebrew_date_after_sunset_month,
    hebrew_death_date_year: before
      ? memorial.hebrew_date_before_sunset_year
      : memorial.hebrew_date_after_sunset_year,
    death_date_verified: true,
    death_date_verified_at: verifiedAt,
    death_date_verified_by: user.uid,
    gregorian_death_date: memorial.gregorian_death_date,
    hebrew_date_before_sunset_day: memorial.hebrew_date_before_sunset_day,
    hebrew_date_before_sunset_month: memorial.hebrew_date_before_sunset_month,
    hebrew_date_before_sunset_year: memorial.hebrew_date_before_sunset_year,
    hebrew_date_after_sunset_day: memorial.hebrew_date_after_sunset_day,
    hebrew_date_after_sunset_month: memorial.hebrew_date_after_sunset_month,
    hebrew_date_after_sunset_year: memorial.hebrew_date_after_sunset_year,
    hebrew_name: memorial.hebrew_name,
    english_name: memorial.english_name,
    birth_year: memorial.birth_year,
    updated_at: serverTimestamp(),
  };

  await setDoc(doc(getFirebaseDb(), 'memorial', MEMORIAL_DOC_ID), update, { merge: true });
  await addDoc(collection(getFirebaseDb(), 'auditLog'), {
    user_id: user.uid,
    action: 'verify_death_date',
    resource_type: 'memorial',
    resource_id: MEMORIAL_DOC_ID,
    changes: {
      death_time_relative_to_sunset: choice,
      hebrew_date: {
        day: update.hebrew_death_date_day,
        month: update.hebrew_death_date_month,
        year: update.hebrew_death_date_year,
      },
    },
    created_at: serverTimestamp(),
  });
}

function prayerFromDoc(id: string, data: Record<string, unknown>): PrayerRecord {
  return {
    id,
    section_id: String(data.section_id ?? id),
    section_order: Number(data.section_order ?? 0),
    title: String(data.title ?? ''),
    hebrew_text: String(data.hebrew_text ?? ''),
    notes: typeof data.notes === 'string' ? data.notes : null,
    source_url: typeof data.source_url === 'string' ? data.source_url : null,
    verses: Array.isArray(data.verses) ? data.verses.map(String) : null,
    verification_status:
      data.verification_status === 'verified' || data.verification_status === 'rejected'
        ? data.verification_status
        : 'pending_family_verification',
    is_verified: Boolean(data.is_verified),
    verified_at: typeof data.verified_at === 'string' ? data.verified_at : null,
    verified_by: typeof data.verified_by === 'string' ? data.verified_by : null,
  };
}

export async function listPrayerSections(): Promise<PrayerRecord[]> {
  const snap = await getDocs(
    query(collection(getFirebaseDb(), 'prayerSections'), orderBy('section_order', 'asc'))
  );
  return snap.docs.map((item) => prayerFromDoc(item.id, item.data()));
}

export async function seedBundledPrayersIfEmpty(): Promise<PrayerRecord[]> {
  const existing = await listPrayerSections();
  if (existing.length > 0) {
    return existing;
  }

  const db = getFirebaseDb();
  await Promise.all(
    sephardiPrayerSections.map((section) =>
      setDoc(doc(db, 'prayerSections', section.section_id), {
        section_id: section.section_id,
        section_order: section.section_order,
        title: section.title,
        hebrew_text: section.hebrew_text,
        notes: section.notes,
        source_url: section.source_url,
        verses: section.verses,
        verification_status: section.verification_status,
        is_verified: section.is_verified,
        verified_at: null,
        verified_by: null,
      })
    )
  );

  return listPrayerSections();
}

export async function updatePrayerVerification(
  sectionId: string,
  newStatus: PrayerRecord['verification_status']
): Promise<void> {
  const user = getFirebaseAuth().currentUser;
  const verified = newStatus === 'verified';
  await updateDoc(doc(getFirebaseDb(), 'prayerSections', sectionId), {
    verification_status: newStatus,
    is_verified: verified,
    verified_at: verified ? new Date().toISOString() : null,
    verified_by: verified ? user?.uid ?? null : null,
  });
  await writeAudit('update_prayer', 'prayerSections', sectionId, newStatus);
}

export async function updatePrayerContent(
  sectionId: string,
  patch: { title: string; verses: string[] }
): Promise<void> {
  await seedBundledPrayersIfEmpty();
  await updateDoc(doc(getFirebaseDb(), 'prayerSections', sectionId), {
    title: patch.title,
    verses: patch.verses,
    hebrew_text: patch.verses.join('\n'),
  });
  await writeAudit('update_prayer', 'prayerSections', sectionId, patch.title);
}
