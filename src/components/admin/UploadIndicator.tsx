export default function UploadIndicator({ label, overlay = false }: { label: string; overlay?: boolean }) {
  const status = (
    <div className="flex items-center gap-3 text-sm font-medium text-text" role="status" aria-live="polite">
      <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-sand border-t-transparent" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );

  if (!overlay) {
    return <div className="rounded-lg border border-sand bg-white px-4 py-3">{status}</div>;
  }

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
      {status}
    </div>
  );
}
