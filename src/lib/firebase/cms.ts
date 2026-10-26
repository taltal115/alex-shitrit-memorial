import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  type Timestamp,
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import type { AdminRole } from '@/config/admins';
import { getFirebaseAuth, getFirebaseDb, getFirebaseStorage } from '@/lib/firebase/client';
import { isFirebaseConfigured } from '@/lib/firebase/config';

export interface HomeContent {
  quote: string;
  intro: string;
  portraitUrl: string;
}

export interface LifeChapter {
  id: string;
  title: string;
  body: string;
  sortOrder: number;
  published: boolean;
}

export interface LegacySection {
  id: string;
  title: string;
  description: string;
  body: string;
  sortOrder: number;
  published: boolean;
  kind: 'section' | 'message';
}

export interface Album {
  id: string;
  title: string;
  description: string;
  sortOrder: number;
  published: boolean;
}

export interface MediaAsset {
  id: string;
  albumId: string;
  url: string;
  storagePath: string;
  caption: string;
  fileType: 'image' | 'video';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Story {
  id: string;
  authorName: string;
  authorRelation: string;
  title: string;
  content: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface SiteSettings {
  aboutText: string;
  contactText: string;
  privacyText: string;
  memoryNotice: string;
}

export interface AdminAccount {
  uid: string;
  email: string;
  displayName: string;
  role: AdminRole;
}

export interface AdminInvite {
  email: string;
  role: AdminRole;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string;
  userId: string;
  actorEmail: string;
  summary: string;
  createdAt: string;
}

export const defaultHome: HomeContent = {
  quote: 'ציטוט או פסוק לזכרו',
  intro: '[טקסט הקדמה על אלכס - יסופק על ידי המשפחה]',
  portraitUrl: '',
};

export const defaultLifeChapters: LifeChapter[] = [
  { id: 'childhood', title: 'ילדות', body: '[פרטים יסופקו על ידי המשפחה]', sortOrder: 0, published: true },
  { id: 'family', title: 'משפחה', body: '[פרטים יסופקו על ידי המשפחה]', sortOrder: 1, published: true },
  { id: 'marriage', title: 'נישואין', body: '[פרטים יסופקו על ידי המשפחה]', sortOrder: 2, published: true },
  { id: 'children', title: 'ילדים', body: '[פרטים יסופקו על ידי המשפחה]', sortOrder: 3, published: true },
  { id: 'grandchildren', title: 'נכדים', body: '[פרטים יסופקו על ידי המשפחה]', sortOrder: 4, published: true },
  { id: 'work', title: 'עבודה וקריירה', body: '[פרטים יסופקו על ידי המשפחה]', sortOrder: 5, published: true },
  { id: 'hobbies', title: 'תחביבים ותחומי עניין', body: '[פרטים יסופקו על ידי המשפחה]', sortOrder: 6, published: true },
  { id: 'milestones', title: 'אירועים ואבני דרך', body: '[פרטים יסופקו על ידי המשפחה]', sortOrder: 7, published: true },
];

export const defaultLegacySections: LegacySection[] = [
  {
    id: 'values',
    title: 'ערכים ועקרונות',
    description: 'העקרונות והערכים שהנחו את חייו',
    body: '[תוכן יסופק על ידי המשפחה]',
    sortOrder: 0,
    published: true,
    kind: 'section',
  },
  {
    id: 'sayings',
    title: 'אמרות ופתגמים',
    description: 'ביטויים, אמרות ופתגמים שהיו אופייניים',
    body: '[תוכן יסופק על ידי המשפחה]',
    sortOrder: 1,
    published: true,
    kind: 'section',
  },
  {
    id: 'advice',
    title: 'עצות ותובנות',
    description: 'חוכמת חיים שנצברה לאורך השנים',
    body: '[תוכן יסופק על ידי המשפחה]',
    sortOrder: 2,
    published: true,
    kind: 'section',
  },
  {
    id: 'traditions',
    title: 'מסורות ומנהגים',
    description: 'מסורות משפחתיות ומנהגים שחשוב לשמר',
    body: '[תוכן יסופק על ידי המשפחה]',
    sortOrder: 3,
    published: true,
    kind: 'section',
  },
  {
    id: 'messages',
    title: 'מסרים לילדים ולנכדים',
    description: 'מסרים אישיים, ברכות ועצות לדורות הבאים',
    body: '[מסרים אישיים, ברכות ועצות לדורות הבאים]',
    sortOrder: 4,
    published: true,
    kind: 'message',
  },
];

export const defaultAlbums: Album[] = [
  { id: 'family', title: 'תמונות משפחתיות', description: 'רגעים משפחתיים מיוחדים', sortOrder: 0, published: true },
  { id: 'events', title: 'אירועים ומועדים', description: 'חגים, שמחות ואירועים', sortOrder: 1, published: true },
  { id: 'travels', title: 'טיולים ונופש', description: 'מסעות וחוויות', sortOrder: 2, published: true },
  { id: 'work', title: 'עבודה וקהילה', description: 'רגעים מהעבודה והפעילות הקהילתית', sortOrder: 3, published: true },
];

export const defaultSettings: SiteSettings = {
  aboutText: 'אתר הנצחה מקוון לזכרו של אלכס שטרית ז"ל',
  contactText: 'לשאלות או לעדכון פרטים, אנא פנו למשפחה.',
  privacyText: 'כל התכנים באתר מוגנים ומנוהלים על ידי המשפחה.',
  memoryNotice: 'כל הזכרונות והסיפורים עוברים אישור מנהלים לפני הפרסום. המשפחה שומרת לעצמה את הזכות לא לפרסם תכנים שאינם מתאימים.',
};

export const AUDIT_LABELS: Record<string, string> = {
  save_home: 'עדכון דף הבית',
  save_chapter: 'עדכון פרק בסיפור החיים',
  delete_chapter: 'מחיקת פרק',
  save_legacy: 'עדכון מורשת',
  delete_legacy: 'מחיקת קטגוריית מורשת',
  save_album: 'עדכון אלבום',
  delete_album: 'מחיקת אלבום',
  upload_media: 'העלאת מדיה',
  update_media: 'עדכון מדיה',
  delete_media: 'מחיקת מדיה',
  submit_story: 'הגשת זיכרון',
  review_story: 'עדכון סטטוס זיכרון',
  delete_story: 'מחיקת זיכרון',
  save_settings: 'עדכון הגדרות',
  invite_admin: 'הזמנת מנהל',
  update_role: 'עדכון תפקיד',
  delete_role: 'הסרת מנהל',
  verify_death_date: 'אימות תאריך פטירה',
  update_prayer: 'עדכון סטטוס תפילה',
};

function sortByOrder<T extends { sortOrder: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function timeValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'toDate' in value) {
    const date = (value as Timestamp).toDate();
    return Number.isNaN(date.getTime()) ? '' : date.toISOString();
  }
  return '';
}

export function storageErrorMessage(error: unknown): string | null {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  if (code.startsWith('storage/')) {
    return 'העלאת הקבצים דורשת הפעלת Storage בקונסול Firebase. פתחו Storage ולחצו על Get Started, ואז נסו שוב.';
  }
  return null;
}

export async function writeAudit(
  action: string,
  resourceType: string,
  resourceId: string,
  summary: string
): Promise<void> {
  try {
    const user = getFirebaseAuth().currentUser;
    if (!user) return;
    await addDoc(collection(getFirebaseDb(), 'auditLog'), {
      user_id: user.uid,
      actor_email: user.email ?? '',
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      summary,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('audit', error);
  }
}

export async function loadHome(): Promise<HomeContent> {
  if (!isFirebaseConfigured()) return defaultHome;
  const snap = await getDoc(doc(getFirebaseDb(), 'siteContent', 'home'));
  if (!snap.exists()) return defaultHome;
  const data = snap.data();
  return {
    quote: asString(data.quote, defaultHome.quote),
    intro: asString(data.intro, defaultHome.intro),
    portraitUrl: asString(data.portraitUrl),
  };
}

export const HOME_CAROUSEL_ALBUM = 'home-carousel';

function imageContentType(file: File): string {
  if (file.type.startsWith('image/') || file.type.startsWith('video/')) return file.type;
  const name = file.name.toLowerCase();
  if (name.endsWith('.png')) return 'image/png';
  if (name.endsWith('.webp')) return 'image/webp';
  if (name.endsWith('.gif')) return 'image/gif';
  if (name.endsWith('.mp4')) return 'video/mp4';
  if (name.endsWith('.webm')) return 'video/webm';
  return 'image/jpeg';
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('storage-timeout')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('קריאת התמונה נכשלה'));
    reader.readAsDataURL(blob);
  });
}

async function compressImageFile(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  let maxEdge = 1600;

  try {
    for (let scalePass = 0; scalePass < 3; scalePass += 1) {
      const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height, 1));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('לא הצלחנו לעבד את התמונה');
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      let quality = 0.82;
      for (let attempt = 0; attempt < 6; attempt += 1) {
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
        if (blob) {
          const dataUrl = await blobToDataUrl(blob);
          // A Firestore document is limited to 1 MiB, and base64 is larger than the file.
          if (dataUrl.length < 900_000) return dataUrl;
        }
        quality = Math.max(0.35, quality - 0.1);
      }
      maxEdge = Math.round(maxEdge * 0.65);
    }
  } finally {
    bitmap.close();
  }

  throw new Error('התמונה גדולה מדי אחרי דחיסה. נסו תמונה קטנה יותר.');
}

async function storeImageFile(file: File, pathPrefix: string): Promise<{ url: string; storagePath: string }> {
  const contentType = imageContentType(file);
  const id = crypto.randomUUID();
  const storagePath = `media/${pathPrefix}/${id}`;
  try {
    const storageRef = ref(getFirebaseStorage(), storagePath);
    await withTimeout(uploadBytes(storageRef, file, { contentType }), 12000);
    const url = await getDownloadURL(storageRef);
    return { url, storagePath };
  } catch (error) {
    if (contentType.startsWith('video/')) {
      throw new Error('העלאת סרטונים דורשת Firebase Storage. בקונסול Firebase פתחו Storage ולחצו Get Started.');
    }
    console.error('storage upload failed, saving a compressed copy', error);
    const url = await compressImageFile(file);
    return { url, storagePath: '' };
  }
}

export async function uploadPortrait(file: File): Promise<string> {
  const storedFile = await storeImageFile(file, 'portrait');
  return storedFile.url;
}

const copyListeners = new Set<() => void>();
let copyCache: Record<string, string> | null = null;

export function subscribeSiteCopy(listener: () => void): () => void {
  copyListeners.add(listener);
  return () => copyListeners.delete(listener);
}

export function readSiteCopyCache(): Record<string, string> | null {
  return copyCache;
}

export async function loadSiteCopy(): Promise<Record<string, string>> {
  if (copyCache) return copyCache;
  if (!isFirebaseConfigured()) {
    copyCache = {};
    return copyCache;
  }
  const snap = await getDoc(doc(getFirebaseDb(), 'siteContent', 'texts'));
  const values = snap.data()?.values;
  copyCache = values && typeof values === 'object' ? (values as Record<string, string>) : {};
  return copyCache;
}

export async function saveSiteCopyValue(id: string, value: string): Promise<void> {
  const ref = doc(getFirebaseDb(), 'siteContent', 'texts');
  await setDoc(ref, { updatedAt: new Date().toISOString() }, { merge: true });
  await updateDoc(ref, { [`values.${id}`]: value });
  copyCache = { ...(copyCache ?? {}), [id]: value };
  copyListeners.forEach((listener) => listener());
  await writeAudit('save_home', 'siteContent', id, value.slice(0, 80));
}

export async function saveHome(content: HomeContent): Promise<void> {
  await setDoc(doc(getFirebaseDb(), 'siteContent', 'home'), content, { merge: true });
  await writeAudit('save_home', 'siteContent', 'home', 'עודכן הטקסט או התמונה בדף הבית');
}

async function listOrdered<T>(name: string, map: (id: string, data: Record<string, unknown>) => T): Promise<T[]> {
  const snap = await getDocs(collection(getFirebaseDb(), name));
  return snap.docs.map((item) => map(item.id, item.data()));
}

function chapterFromDoc(id: string, data: Record<string, unknown>): LifeChapter {
  return {
    id,
    title: asString(data.title),
    body: asString(data.body),
    sortOrder: Number(data.sortOrder ?? 0),
    published: data.published !== false,
  };
}

async function markCustom(section: 'lifeStory' | 'legacy' | 'gallery'): Promise<void> {
  await setDoc(doc(getFirebaseDb(), 'siteContent', section), { customized: true }, { merge: true });
}

export async function isSectionCustomized(section: 'lifeStory' | 'legacy' | 'gallery'): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;
  const snap = await getDoc(doc(getFirebaseDb(), 'siteContent', section));
  return snap.exists() && snap.data().customized === true;
}

export async function listLifeChapters(): Promise<LifeChapter[]> {
  if (!isFirebaseConfigured()) return [];
  return sortByOrder(await listOrdered('lifeChapters', chapterFromDoc));
}

export async function loadPublishedLifeChapters(): Promise<LifeChapter[]> {
  if (!isFirebaseConfigured() || !(await isSectionCustomized('lifeStory'))) {
    return defaultLifeChapters;
  }
  const snap = await getDocs(
    query(collection(getFirebaseDb(), 'lifeChapters'), where('published', '==', true))
  );
  return sortByOrder(snap.docs.map((item) => chapterFromDoc(item.id, item.data())));
}

export async function saveLifeChapter(chapter: LifeChapter): Promise<void> {
  await setDoc(doc(getFirebaseDb(), 'lifeChapters', chapter.id), chapter);
  await markCustom('lifeStory');
  await writeAudit('save_chapter', 'lifeChapters', chapter.id, chapter.title);
}

export async function saveLifeChapters(chapters: LifeChapter[]): Promise<void> {
  const db = getFirebaseDb();
  await Promise.all(chapters.map((chapter) => setDoc(doc(db, 'lifeChapters', chapter.id), chapter)));
  await markCustom('lifeStory');
  await writeAudit('save_chapter', 'lifeChapters', 'all', `${chapters.length} פרקים`);
}

export async function deleteLifeChapter(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), 'lifeChapters', id));
  await markCustom('lifeStory');
  await writeAudit('delete_chapter', 'lifeChapters', id, id);
}

function legacyFromDoc(id: string, data: Record<string, unknown>): LegacySection {
  return {
    id,
    title: asString(data.title),
    description: asString(data.description),
    body: asString(data.body),
    sortOrder: Number(data.sortOrder ?? 0),
    published: data.published !== false,
    kind: data.kind === 'message' ? 'message' : 'section',
  };
}

export async function listLegacySections(): Promise<LegacySection[]> {
  if (!isFirebaseConfigured()) return [];
  return sortByOrder(await listOrdered('legacySections', legacyFromDoc));
}

export async function loadPublishedLegacy(): Promise<LegacySection[]> {
  if (!isFirebaseConfigured() || !(await isSectionCustomized('legacy'))) {
    return defaultLegacySections;
  }
  const snap = await getDocs(
    query(collection(getFirebaseDb(), 'legacySections'), where('published', '==', true))
  );
  return sortByOrder(snap.docs.map((item) => legacyFromDoc(item.id, item.data())));
}

export async function saveLegacySection(section: LegacySection): Promise<void> {
  await setDoc(doc(getFirebaseDb(), 'legacySections', section.id), section);
  await markCustom('legacy');
  await writeAudit('save_legacy', 'legacySections', section.id, section.title);
}

export async function saveLegacySections(sections: LegacySection[]): Promise<void> {
  const db = getFirebaseDb();
  await Promise.all(sections.map((section) => setDoc(doc(db, 'legacySections', section.id), section)));
  await markCustom('legacy');
  await writeAudit('save_legacy', 'legacySections', 'all', `${sections.length} קטגוריות`);
}

export async function deleteLegacySection(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), 'legacySections', id));
  await markCustom('legacy');
  await writeAudit('delete_legacy', 'legacySections', id, id);
}

function albumFromDoc(id: string, data: Record<string, unknown>): Album {
  return {
    id,
    title: asString(data.title),
    description: asString(data.description),
    sortOrder: Number(data.sortOrder ?? 0),
    published: data.published !== false,
  };
}

export async function listAlbums(): Promise<Album[]> {
  if (!isFirebaseConfigured()) return [];
  return sortByOrder(await listOrdered('albums', albumFromDoc));
}

export async function loadPublishedAlbums(): Promise<Album[]> {
  if (!isFirebaseConfigured() || !(await isSectionCustomized('gallery'))) {
    return defaultAlbums;
  }
  const snap = await getDocs(query(collection(getFirebaseDb(), 'albums'), where('published', '==', true)));
  return sortByOrder(snap.docs.map((item) => albumFromDoc(item.id, item.data())));
}

export async function saveAlbum(album: Album): Promise<void> {
  await setDoc(doc(getFirebaseDb(), 'albums', album.id), album);
  await markCustom('gallery');
  await writeAudit('save_album', 'albums', album.id, album.title);
}

export async function saveAlbums(albums: Album[]): Promise<void> {
  const db = getFirebaseDb();
  await Promise.all(albums.map((album) => setDoc(doc(db, 'albums', album.id), album)));
  await markCustom('gallery');
  await writeAudit('save_album', 'albums', 'all', `${albums.length} אלבומים`);
}

export async function deleteAlbum(id: string): Promise<void> {
  const media = (await listMedia()).filter((item) => item.albumId === id);
  await Promise.all(media.map((item) => deleteMedia(item, false)));
  await deleteDoc(doc(getFirebaseDb(), 'albums', id));
  await markCustom('gallery');
  await writeAudit('delete_album', 'albums', id, id);
}

function mediaFromDoc(id: string, data: Record<string, unknown>): MediaAsset {
  return {
    id,
    albumId: asString(data.albumId),
    url: asString(data.url),
    storagePath: asString(data.storagePath),
    caption: asString(data.caption),
    fileType: data.fileType === 'video' ? 'video' : 'image',
    approvalStatus:
      data.approvalStatus === 'pending' || data.approvalStatus === 'rejected'
        ? data.approvalStatus
        : 'approved',
    createdAt: timeValue(data.createdAt),
  };
}

function sortMedia(items: MediaAsset[]): MediaAsset[] {
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listMedia(): Promise<MediaAsset[]> {
  if (!isFirebaseConfigured()) return [];
  return sortMedia(await listOrdered('mediaAssets', mediaFromDoc));
}

export async function listApprovedMedia(): Promise<MediaAsset[]> {
  if (!isFirebaseConfigured()) return [];
  const snap = await getDocs(
    query(collection(getFirebaseDb(), 'mediaAssets'), where('approvalStatus', '==', 'approved'))
  );
  return sortMedia(snap.docs.map((item) => mediaFromDoc(item.id, item.data())));
}

export async function uploadMediaFile(albumId: string, file: File): Promise<MediaAsset> {
  const id = crypto.randomUUID();
  const storedFile = await storeImageFile(file, `${albumId}/${id}`);
  const asset: MediaAsset = {
    id,
    albumId,
    url: storedFile.url,
    storagePath: storedFile.storagePath,
    caption: '',
    fileType: imageContentType(file).startsWith('video/') ? 'video' : 'image',
    approvalStatus: 'approved',
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(getFirebaseDb(), 'mediaAssets', id), asset);
  await writeAudit('upload_media', 'mediaAssets', id, file.name);
  return asset;
}

export async function updateMedia(asset: MediaAsset): Promise<void> {
  await setDoc(doc(getFirebaseDb(), 'mediaAssets', asset.id), asset);
  await writeAudit('update_media', 'mediaAssets', asset.id, asset.caption || asset.id);
}

export async function deleteMedia(asset: MediaAsset, audit = true): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), 'mediaAssets', asset.id));
  if (asset.storagePath) {
    try {
      await deleteObject(ref(getFirebaseStorage(), asset.storagePath));
    } catch (error) {
      console.error('storage delete', error);
    }
  }
  if (audit) await writeAudit('delete_media', 'mediaAssets', asset.id, asset.caption || asset.id);
}

function storyFromDoc(id: string, data: Record<string, unknown>): Story {
  const status = data.approvalStatus;
  return {
    id,
    authorName: asString(data.authorName),
    authorRelation: asString(data.authorRelation),
    title: asString(data.title),
    content: asString(data.content),
    approvalStatus: status === 'approved' || status === 'rejected' ? status : 'pending',
    createdAt: timeValue(data.createdAt),
  };
}

export async function listStories(status?: Story['approvalStatus']): Promise<Story[]> {
  if (!isFirebaseConfigured()) return [];
  const stories = collection(getFirebaseDb(), 'stories');
  const snap = status
    ? await getDocs(query(stories, where('approvalStatus', '==', status)))
    : await getDocs(stories);
  return snap.docs
    .map((item) => storyFromDoc(item.id, item.data()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function submitStory(input: Omit<Story, 'id' | 'approvalStatus' | 'createdAt'>): Promise<void> {
  const createdAt = new Date().toISOString();
  await addDoc(collection(getFirebaseDb(), 'stories'), {
    ...input,
    approvalStatus: 'pending',
    createdAt,
  });
}

export async function updateStoryText(id: string, patch: { title: string; content: string }): Promise<void> {
  await setDoc(doc(getFirebaseDb(), 'stories', id), patch, { merge: true });
  await writeAudit('review_story', 'stories', id, patch.title);
}

export async function reviewStory(id: string, approvalStatus: Story['approvalStatus']): Promise<void> {
  const snap = await getDoc(doc(getFirebaseDb(), 'stories', id));
  if (!snap.exists()) throw new Error('הזיכרון לא נמצא');
  await setDoc(doc(getFirebaseDb(), 'stories', id), { approvalStatus }, { merge: true });
  await writeAudit('review_story', 'stories', id, approvalStatus);
}

export async function deleteStory(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), 'stories', id));
  await writeAudit('delete_story', 'stories', id, id);
}

export async function loadSettings(): Promise<SiteSettings> {
  if (!isFirebaseConfigured()) return defaultSettings;
  const snap = await getDoc(doc(getFirebaseDb(), 'settings', 'site'));
  if (!snap.exists()) return defaultSettings;
  const data = snap.data();
  return {
    aboutText: asString(data.aboutText, defaultSettings.aboutText),
    contactText: asString(data.contactText, defaultSettings.contactText),
    privacyText: asString(data.privacyText, defaultSettings.privacyText),
    memoryNotice: asString(data.memoryNotice, defaultSettings.memoryNotice),
  };
}

export async function saveSettings(settings: SiteSettings): Promise<void> {
  await setDoc(doc(getFirebaseDb(), 'settings', 'site'), settings);
  await writeAudit('save_settings', 'settings', 'site', 'עודכנו הגדרות האתר');
}

export async function listAdminAccounts(): Promise<AdminAccount[]> {
  const snap = await getDocs(collection(getFirebaseDb(), 'roles'));
  return snap.docs
    .map((item) => {
      const data = item.data();
      const role = data.role === 'content_manager' ? 'content_manager' : 'super_admin';
      return {
        uid: item.id,
        email: asString(data.email),
        displayName: asString(data.displayName),
        role,
      } satisfies AdminAccount;
    })
    .sort((a, b) => a.email.localeCompare(b.email));
}

export async function listInvites(): Promise<AdminInvite[]> {
  const snap = await getDocs(collection(getFirebaseDb(), 'adminInvites'));
  return snap.docs.map((item) => {
    const data = item.data();
    return {
      email: asString(data.email, item.id),
      role: data.role === 'content_manager' ? 'content_manager' : 'super_admin',
      createdAt: timeValue(data.createdAt),
    };
  });
}

export async function inviteAdmin(email: string, role: AdminRole): Promise<void> {
  const normalized = email.trim().toLowerCase();
  await setDoc(doc(getFirebaseDb(), 'adminInvites', normalized), {
    email: normalized,
    role,
    createdAt: new Date().toISOString(),
  });
  await writeAudit('invite_admin', 'adminInvites', normalized, `${normalized} · ${role}`);
}

export async function updateAdminRole(uid: string, role: AdminRole): Promise<void> {
  await setDoc(doc(getFirebaseDb(), 'roles', uid), { role, updatedAt: new Date().toISOString() }, { merge: true });
  await writeAudit('update_role', 'roles', uid, role);
}

export async function removeAdmin(uid: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), 'roles', uid));
  await writeAudit('delete_role', 'roles', uid, uid);
}

export async function cancelInvite(email: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), 'adminInvites', email.toLowerCase()));
}

export async function listAuditEntries(): Promise<AuditEntry[]> {
  const snap = await getDocs(collection(getFirebaseDb(), 'auditLog'));
  return snap.docs
    .map((item) => {
      const data = item.data();
      const action = asString(data.action);
      return {
        id: item.id,
        action,
        resourceType: asString(data.resource_type),
        resourceId: asString(data.resource_id),
        userId: asString(data.user_id),
        actorEmail: asString(data.actor_email),
        summary: asString(data.summary, AUDIT_LABELS[action] || action),
        createdAt: timeValue(data.created_at),
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function exportSiteBackup(): Promise<Record<string, unknown>> {
  const db = getFirebaseDb();
  async function dump(name: string) {
    const snap = await getDocs(collection(db, name));
    return snap.docs.map((item) => ({ id: item.id, ...item.data() }));
  }

  const [home, settings, memorial] = await Promise.all([
    getDoc(doc(db, 'siteContent', 'home')),
    getDoc(doc(db, 'settings', 'site')),
    getDoc(doc(db, 'memorial', 'alex')),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    home: home.exists() ? home.data() : null,
    settings: settings.exists() ? settings.data() : null,
    memorial: memorial.exists() ? memorial.data() : null,
    lifeChapters: await dump('lifeChapters'),
    legacySections: await dump('legacySections'),
    albums: await dump('albums'),
    mediaAssets: await dump('mediaAssets'),
    stories: await dump('stories'),
    prayerSections: await dump('prayerSections'),
    roles: await dump('roles'),
    adminInvites: await dump('adminInvites'),
    auditLog: await dump('auditLog'),
  };
}
