'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { isAllowlistedAdmin, type AdminRole } from '@/config/admins';
import {
  cancelInvite,
  inviteAdmin,
  listAdminAccounts,
  listInvites,
  removeAdmin,
  updateAdminRole,
  type AdminAccount,
  type AdminInvite,
} from '@/lib/firebase/cms';

const inputClass =
  'w-full px-4 py-2 rounded-lg border border-sand/30 focus:border-sand focus:ring-2 focus:ring-sand/20 outline-none';

function roleLabel(role: AdminRole): string {
  return role === 'super_admin' ? 'מנהל-על' : 'מנהל תוכן';
}

function UsersEditor() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [invites, setInvites] = useState<AdminInvite[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminRole>('content_manager');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const [nextAccounts, nextInvites] = await Promise.all([listAdminAccounts(), listInvites()]);
    setAccounts(nextAccounts);
    setInvites(nextInvites);
  }

  useEffect(() => {
    refresh().catch(() => setError('שגיאה בטעינת המנהלים'));
  }, []);

  async function onInvite(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const existing = accounts.find((account) => account.email === email.trim().toLowerCase());
      if (existing) {
        await updateAdminRole(existing.uid, role);
        setMessage('התפקיד של החשבון הקיים עודכן');
      } else {
        await inviteAdmin(email, role);
        setMessage('ההזמנה נשמרה. הגישה תיפתח אחרי שהמשתמש יתחבר עם אותה כתובת.');
      }
      setEmail('');
      await refresh();
    } catch {
      setError('שמירת ההרשאה נכשלה');
    } finally {
      setBusy(false);
    }
  }

  async function changeRole(account: AdminAccount, nextRole: AdminRole) {
    setError(null);
    try {
      await updateAdminRole(account.uid, nextRole);
      await refresh();
    } catch {
      setError('עדכון התפקיד נכשל');
    }
  }

  async function remove(account: AdminAccount) {
    if (isAllowlistedAdmin(account.email)) {
      setError('אי אפשר להסיר את מנהל-העל הראשי');
      return;
    }
    if (!window.confirm(`להסיר את ${account.email}?`)) return;
    try {
      await removeAdmin(account.uid);
      await refresh();
    } catch {
      setError('ההסרה נכשלה');
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onInvite} className="bg-linen p-6 rounded-lg space-y-4">
        <h2 className="text-xl font-semibold">הוספת מנהל</h2>
        <p className="text-sm text-gray-600">
          אם האדם כבר התחבר לאתר, התפקיד מתעדכן מיד. אחרת נשמרת הזמנה עד ההתחברות הראשונה.
        </p>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="דוא״ל"
          className={inputClass}
        />
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as AdminRole)}
          className={inputClass}
        >
          <option value="content_manager">מנהל תוכן</option>
          <option value="super_admin">מנהל-על</option>
        </select>
        <button type="submit" disabled={busy} className="bg-sand text-white px-5 py-2 rounded-lg disabled:opacity-50">
          שמירה
        </button>
      </form>

      {message && <p className="text-green-800">{message}</p>}
      {error && <p className="text-red-700">{error}</p>}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">מנהלים פעילים</h2>
        {accounts.length === 0 && <p className="text-gray-600">עדיין אין חשבונות שמורים. התחברות ראשונה של מנהל-העל תוסיף אותו לכאן.</p>}
        {accounts.map((account) => (
          <div key={account.uid} className="bg-linen p-4 rounded-lg flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="font-medium">{account.displayName || account.email}</p>
              <p className="text-sm text-gray-600">{account.email}</p>
            </div>
            <select
              value={account.role}
              onChange={(event) => changeRole(account, event.target.value as AdminRole)}
              disabled={isAllowlistedAdmin(account.email)}
              className="border border-sand/30 rounded-lg px-3 py-2"
            >
              <option value="content_manager">מנהל תוכן</option>
              <option value="super_admin">מנהל-על</option>
            </select>
            <button type="button" onClick={() => remove(account)} className="text-red-700 text-sm">
              הסרה
            </button>
          </div>
        ))}
      </div>

      {invites.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">הזמנות ממתינות</h2>
          {invites.map((invite) => (
            <div key={invite.email} className="bg-white border border-sand/20 p-4 rounded-lg flex justify-between gap-3">
              <p>
                {invite.email} · {roleLabel(invite.role)}
              </p>
              <button
                type="button"
                className="text-red-700 text-sm"
                onClick={() => cancelInvite(invite.email).then(refresh)}
              >
                ביטול
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function UsersAdminPage() {
  return (
    <AdminShell title="ניהול משתמשים" description="הרשאות ותפקידים למנהלי האתר" requireSuper>
      <UsersEditor />
    </AdminShell>
  );
}
