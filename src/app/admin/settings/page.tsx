'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { defaultSettings, loadSettings, saveSettings, type SiteSettings } from '@/lib/firebase/cms';

const inputClass =
  'w-full px-4 py-2 rounded-lg border border-sand/30 focus:border-sand focus:ring-2 focus:ring-sand/20 outline-none';

function SettingsEditor() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadSettings()
      .then(setSettings)
      .catch(() => setError('שגיאה בטעינת ההגדרות'));
  }, []);

  function update(field: keyof SiteSettings, value: string) {
    setSettings((current) => ({ ...current, [field]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await saveSettings(settings);
      setMessage('ההגדרות נשמרו ויופיעו באתר');
    } catch {
      setError('שמירת ההגדרות נכשלה');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="bg-linen p-6 rounded-lg space-y-5">
      <label className="block">
        <span className="block text-sm font-medium mb-2">טקסט אודות בתחתית האתר</span>
        <textarea rows={3} value={settings.aboutText} onChange={(event) => update('aboutText', event.target.value)} className={inputClass} />
      </label>
      <label className="block">
        <span className="block text-sm font-medium mb-2">יצירת קשר</span>
        <textarea rows={3} value={settings.contactText} onChange={(event) => update('contactText', event.target.value)} className={inputClass} />
      </label>
      <label className="block">
        <span className="block text-sm font-medium mb-2">שורת פרטיות</span>
        <textarea rows={3} value={settings.privacyText} onChange={(event) => update('privacyText', event.target.value)} className={inputClass} />
      </label>
      <label className="block">
        <span className="block text-sm font-medium mb-2">הודעה בטופס הזכרונות</span>
        <textarea rows={4} value={settings.memoryNotice} onChange={(event) => update('memoryNotice', event.target.value)} className={inputClass} />
      </label>
      {message && <p className="text-green-800">{message}</p>}
      {error && <p className="text-red-700">{error}</p>}
      <button type="submit" disabled={busy} className="bg-sand text-white px-5 py-2 rounded-lg disabled:opacity-50">
        שמירת הגדרות
      </button>
    </form>
  );
}

export default function SettingsAdminPage() {
  return (
    <AdminShell title="הגדרות כלליות" description="הטקסטים שמופיעים בתחתית האתר ובטופס הזכרונות">
      <SettingsEditor />
    </AdminShell>
  );
}
