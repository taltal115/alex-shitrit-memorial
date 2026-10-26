'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { AUDIT_LABELS, listAuditEntries, type AuditEntry } from '@/lib/firebase/cms';

function formatWhen(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('he-IL');
}

function AuditList() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listAuditEntries()
      .then(setEntries)
      .catch(() => setError('שגיאה בטעינת יומן הפעולות'));
  }, []);

  if (error) return <p className="text-red-700">{error}</p>;
  if (entries.length === 0) return <p className="text-gray-600">עדיין אין פעולות שנרשמו.</p>;

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <article key={entry.id} className="bg-linen p-4 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
            <h2 className="font-semibold">{AUDIT_LABELS[entry.action] || entry.action}</h2>
            <time className="text-sm text-gray-600">{formatWhen(entry.createdAt)}</time>
          </div>
          <p className="text-sm text-gray-700 mt-1">{entry.summary}</p>
          <p className="text-xs text-gray-500 mt-2">
            {entry.actorEmail || entry.userId} · {entry.resourceType}
          </p>
        </article>
      ))}
    </div>
  );
}

export default function AuditAdminPage() {
  return (
    <AdminShell title="יומן פעולות" description="שינויים שנשמרו על ידי מנהלי האתר">
      <AuditList />
    </AdminShell>
  );
}
