'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Pencil } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { loadSiteCopy, readSiteCopyCache, saveSiteCopyValue, subscribeSiteCopy } from '@/lib/firebase/cms';

const AdminModeContext = createContext(false);

export function AdminModeProvider({ children }: { children: ReactNode }) {
  const { authorized } = useAdminAuth();
  return <AdminModeContext.Provider value={authorized}>{children}</AdminModeContext.Provider>;
}

export function useIsAdmin(): boolean {
  return useContext(AdminModeContext);
}

interface EditableTextProps {
  value: string;
  onSave: (next: string) => Promise<void>;
  className?: string;
  multiline?: boolean;
  block?: boolean;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'blockquote';
  children?: ReactNode;
}

export function EditableText({
  value,
  onSave,
  className,
  multiline = false,
  block = false,
  as: Tag = 'span',
  children,
}: EditableTextProps) {
  const isAdmin = useIsAdmin();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await onSave(draft);
      setEditing(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'השמירה נכשלה');
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className={block ? 'relative block' : 'relative inline'}>
      {editing ? (
        <span className="block rounded-lg border border-sand bg-white p-3 shadow-lg">
          {multiline ? (
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={6}
              className="w-full rounded-lg border border-sand/30 px-3 py-2 outline-none"
            />
          ) : (
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="w-full rounded-lg border border-sand/30 px-3 py-2 outline-none"
            />
          )}
          <span className="mt-2 flex gap-2">
            <button type="button" onClick={save} disabled={busy} className="rounded-lg bg-sand px-3 py-1 text-sm text-white disabled:opacity-50">
              שמירה
            </button>
            <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-sand px-3 py-1 text-sm">
              ביטול
            </button>
          </span>
          {error && <span className="mt-2 block text-sm text-red-700">{error}</span>}
        </span>
      ) : (
        <>
          {children ?? <Tag className={className}>{value}</Tag>}
          {isAdmin && (
            <button
              type="button"
              aria-label="עריכת טקסט"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setDraft(value);
                setEditing(true);
              }}
              className="mr-1 inline-flex align-middle text-current opacity-70 hover:opacity-100"
            >
              <Pencil size={14} />
            </button>
          )}
        </>
      )}
    </span>
  );
}

interface CopyTextProps {
  id: string;
  fallback: string;
  className?: string;
  multiline?: boolean;
  block?: boolean;
  as?: EditableTextProps['as'];
}

export function CopyText({ id, fallback, className, multiline = false, block = false, as }: CopyTextProps) {
  const [value, setValue] = useState(fallback);

  useEffect(() => {
    const sync = () => setValue(readSiteCopyCache()?.[id] ?? fallback);
    loadSiteCopy().then(sync).catch(() => undefined);
    return subscribeSiteCopy(sync);
  }, [id, fallback]);

  return (
    <EditableText
      value={value}
      className={className}
      multiline={multiline}
      block={block}
      as={as}
      onSave={(next) => saveSiteCopyValue(id, next)}
    />
  );
}
