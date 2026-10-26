'use client';

import { useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { exportSiteBackup } from '@/lib/firebase/cms';

function BackupPanel() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    setBusy(true);
    setError(null);
    try {
      const backup = await exportSiteBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `alex-shitrit-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('יצירת הגיבוי נכשלה');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-linen p-6 rounded-lg space-y-4">
      <p className="text-gray-700">
        הקובץ כולל את הטקסטים, התפילות, הזכרונות, האלבומים, פרטי המדיה, המנהלים ויומן הפעולות.
        קבצי התמונות עצמם נשארים ב-Firebase Storage, והקובץ שומר את הקישורים אליהם.
      </p>
      <button type="button" onClick={download} disabled={busy} className="bg-sand text-white px-5 py-2 rounded-lg disabled:opacity-50">
        {busy ? 'מכין גיבוי...' : 'הורדת גיבוי'}
      </button>
      {error && <p className="text-red-700">{error}</p>}
    </div>
  );
}

export default function BackupAdminPage() {
  return (
    <AdminShell title="גיבוי וייצוא" description="הורדת עותק של תכני האתר" requireSuper>
      <BackupPanel />
    </AdminShell>
  );
}
