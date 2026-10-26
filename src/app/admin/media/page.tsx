'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import UploadIndicator from '@/components/admin/UploadIndicator';
import {
  HOME_CAROUSEL_ALBUM,
  defaultAlbums,
  deleteAlbum,
  deleteMedia,
  isSectionCustomized,
  listAlbums,
  listMedia,
  saveAlbum,
  storageErrorMessage,
  updateMedia,
  uploadMediaFile,
  type Album,
  type MediaAsset,
} from '@/lib/firebase/cms';

const inputClass =
  'w-full px-4 py-2 rounded-lg border border-sand/30 focus:border-sand focus:ring-2 focus:ring-sand/20 outline-none';

function MediaEditor() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(HOME_CAROUSEL_ALBUM);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploadLabel, setUploadLabel] = useState<string | null>(null);

  async function refresh() {
    const [nextAlbums, nextMedia] = await Promise.all([listAlbums(), listMedia()]);
    setAlbums(nextAlbums);
    setMedia(nextMedia);
    setSelectedId((current) => current ?? nextAlbums[0]?.id ?? null);
  }

  useEffect(() => {
    refresh().catch(() => setError('שגיאה בטעינת הגלריה'));
  }, []);

  async function createAlbum(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const album: Album = {
        id: crypto.randomUUID(),
        title: title.trim(),
        description: description.trim(),
        sortOrder: albums.length,
        published: true,
      };
      await saveAlbum(album);
      setTitle('');
      setDescription('');
      setSelectedId(album.id);
      await refresh();
    } catch {
      setError('יצירת האלבום נכשלה');
    } finally {
      setBusy(false);
    }
  }

  async function addStarterAlbums() {
    setBusy(true);
    setError(null);
    try {
      const customized = await isSectionCustomized('gallery');
      if (customized || albums.length > 0) return;
      for (const album of defaultAlbums) {
        await saveAlbum(album);
      }
      await refresh();
    } catch {
      setError('יצירת האלבומים נכשלה');
    } finally {
      setBusy(false);
    }
  }

  async function removeAlbum(id: string) {
    if (!window.confirm('למחוק את האלבום ואת הקבצים שבתוכו?')) return;
    setBusy(true);
    try {
      await deleteAlbum(id);
      if (selectedId === id) setSelectedId(HOME_CAROUSEL_ALBUM);
      await refresh();
    } catch {
      setError('מחיקת האלבום נכשלה');
    } finally {
      setBusy(false);
    }
  }

  async function onUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!selectedId || files.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      for (let index = 0; index < files.length; index += 1) {
        setUploadLabel(files.length > 1 ? `מעלה תמונה ${index + 1} מתוך ${files.length}` : 'מעלה את התמונה...');
        await uploadMediaFile(selectedId, files[index]);
      }
      await refresh();
    } catch (uploadError) {
      setError(
        storageErrorMessage(uploadError) ??
          (uploadError instanceof Error ? uploadError.message : 'ההעלאה נכשלה')
      );
    } finally {
      setUploadLabel(null);
      setBusy(false);
    }
  }

  async function moveMedia(asset: MediaAsset, albumId: string) {
    if (albumId === asset.albumId) return;
    setBusy(true);
    setError(null);
    try {
      await updateMedia({ ...asset, albumId });
      setSelectedId(albumId);
      await refresh();
    } catch {
      setError('העברת התמונה נכשלה');
    } finally {
      setBusy(false);
    }
  }

  async function saveCaption(asset: MediaAsset, caption: string) {
    try {
      await updateMedia({ ...asset, caption });
      await refresh();
    } catch {
      setError('שמירת הכיתוב נכשלה');
    }
  }

  async function removeMedia(asset: MediaAsset) {
    if (!window.confirm('למחוק את הקובץ?')) return;
    try {
      await deleteMedia(asset);
      await refresh();
    } catch {
      setError('מחיקת הקובץ נכשלה');
    }
  }

  const places = [
    { id: HOME_CAROUSEL_ALBUM, title: 'התמונה הראשית בבית' },
    ...albums.map((album) => ({ id: album.id, title: album.title })),
  ];
  const selectedMedia = media.filter((item) => item.albumId === selectedId);
  const selectedIsHome = selectedId === HOME_CAROUSEL_ALBUM;

  return (
    <div className="space-y-8">
      <form onSubmit={createAlbum} className="bg-linen p-6 rounded-lg space-y-3">
        <h2 className="text-xl font-semibold">אלבום חדש</h2>
        <input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="שם האלבום" className={inputClass} />
        <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="תיאור" className={inputClass} />
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={busy} className="bg-sand text-white px-5 py-2 rounded-lg disabled:opacity-50">
            יצירת אלבום
          </button>
          {albums.length === 0 && (
            <button type="button" disabled={busy} onClick={addStarterAlbums} className="border border-sand px-5 py-2 rounded-lg disabled:opacity-50">
              יצירת ארבעת האלבומים ההתחלתיים
            </button>
          )}
        </div>
      </form>

      {error && <p className="text-red-700">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedId(HOME_CAROUSEL_ALBUM)}
          className={`px-4 py-2 rounded-lg ${selectedIsHome ? 'bg-sand text-white' : 'bg-linen'}`}
        >
          התמונה הראשית בבית
        </button>
        {albums.map((album) => (
          <button
            key={album.id}
            type="button"
            onClick={() => setSelectedId(album.id)}
            className={`px-4 py-2 rounded-lg ${selectedId === album.id ? 'bg-sand text-white' : 'bg-linen'}`}
          >
            {album.title}
          </button>
        ))}
      </div>

      {selectedId && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className={`bg-sand text-white px-5 py-2 rounded-lg ${busy ? 'cursor-wait opacity-70' : 'cursor-pointer'}`}>
              {uploadLabel ?? (selectedIsHome ? 'העלאה לתמונה הראשית' : 'העלאת תמונות או סרטונים')}
              <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={onUpload} disabled={busy} />
            </label>
            {!selectedIsHome && (
              <button type="button" onClick={() => removeAlbum(selectedId)} className="text-red-700" disabled={busy}>
                מחיקת האלבום
              </button>
            )}
          </div>
          {uploadLabel && <UploadIndicator label={uploadLabel} />}
          {selectedMedia.length === 0 && !uploadLabel && (
            <p className="text-gray-600">{selectedIsHome ? 'אין תמונות במסך הבית.' : 'אין תמונות במיקום הזה.'}</p>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            {selectedMedia.map((asset) => (
              <figure key={asset.id} className="bg-linen rounded-lg overflow-hidden">
                {asset.fileType === 'video' ? (
                  <video src={asset.url} controls className="w-full aspect-video bg-black" />
                ) : (
                  <img src={asset.url} alt={asset.caption || 'תמונה מהגלריה'} className="w-full aspect-video object-cover" />
                )}
                <figcaption className="p-3 space-y-2">
                  <label className="block text-sm">
                    מיקום באתר
                    <select
                      value={places.some((place) => place.id === asset.albumId) ? asset.albumId : selectedId}
                      onChange={(event) => moveMedia(asset, event.target.value)}
                      disabled={busy}
                      className={`${inputClass} mt-1`}
                    >
                      {places.map((place) => (
                        <option key={place.id} value={place.id}>
                          {place.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <input
                    defaultValue={asset.caption}
                    onBlur={(event) => {
                      if (event.target.value !== asset.caption) saveCaption(asset, event.target.value);
                    }}
                    placeholder="כיתוב"
                    className={inputClass}
                  />
                  <button type="button" onClick={() => removeMedia(asset)} className="text-sm text-red-700" disabled={busy}>
                    מחיקה
                  </button>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MediaAdminPage() {
  return (
    <AdminShell title="גלריה ומדיה" description="אלבומים, תמונות וסרטונים שמופיעים בגלריה">
      <MediaEditor />
    </AdminShell>
  );
}
