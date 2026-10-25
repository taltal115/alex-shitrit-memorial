'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { deleteStory, listStories, reviewStory, type Story } from '@/lib/firebase/cms';

const filters: Array<{ id: Story['approvalStatus'] | 'all'; label: string }> = [
  { id: 'pending', label: 'ממתינים' },
  { id: 'approved', label: 'מאושרים' },
  { id: 'rejected', label: 'נדחו' },
  { id: 'all', label: 'הכל' },
];

function formatWhen(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('he-IL');
}

function StoriesEditor() {
  const [stories, setStories] = useState<Story[]>([]);
  const [filter, setFilter] = useState<Story['approvalStatus'] | 'all'>('pending');
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function refresh() {
    setStories(await listStories());
  }

  useEffect(() => {
    refresh().catch(() => setError('שגיאה בטעינת הזכרונות'));
  }, []);

  async function setStatus(id: string, status: Story['approvalStatus']) {
    setBusyId(id);
    setError(null);
    try {
      await reviewStory(id, status);
      await refresh();
    } catch {
      setError('עדכון הסטטוס נכשל');
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!window.confirm('למחוק את הזיכרון?')) return;
    setBusyId(id);
    try {
      await deleteStory(id);
      await refresh();
    } catch {
      setError('המחיקה נכשלה');
    } finally {
      setBusyId(null);
    }
  }

  const visible = stories.filter((story) => filter === 'all' || story.approvalStatus === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`px-4 py-2 rounded-lg ${filter === item.id ? 'bg-sand text-white' : 'bg-linen'}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {error && <p className="text-red-700">{error}</p>}
      {visible.length === 0 && <p className="text-gray-600">אין זכרונות בקבוצה הזו.</p>}
      {visible.map((story) => (
        <article key={story.id} className="bg-linen p-5 rounded-lg space-y-3">
          <div>
            <h2 className="text-xl font-semibold">{story.title}</h2>
            <p className="text-sm text-gray-600">
              {story.authorName} · {story.authorRelation} · {formatWhen(story.createdAt)}
            </p>
          </div>
          <p className="whitespace-pre-wrap text-gray-800">{story.content}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busyId === story.id} onClick={() => setStatus(story.id, 'approved')} className="bg-sand text-white px-4 py-2 rounded-lg disabled:opacity-50">
              אישור
            </button>
            <button type="button" disabled={busyId === story.id} onClick={() => setStatus(story.id, 'rejected')} className="border border-sand px-4 py-2 rounded-lg disabled:opacity-50">
              דחייה
            </button>
            <button type="button" disabled={busyId === story.id} onClick={() => setStatus(story.id, 'pending')} className="border border-sand px-4 py-2 rounded-lg disabled:opacity-50">
              החזרה לבדיקה
            </button>
            <button type="button" disabled={busyId === story.id} onClick={() => remove(story.id)} className="text-red-700 px-4 py-2">
              מחיקה
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function StoriesAdminPage() {
  return (
    <AdminShell title="אישור זכרונות" description="זכרונות שנשלחו מהאתר מחכים כאן לפני שהם מתפרסמים">
      <StoriesEditor />
    </AdminShell>
  );
}
