const PLACEHOLDER_URL = 'your-project.supabase.co';
const PLACEHOLDER_KEY = 'your-anon-key-here';

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

  if (!url || !key) return false;
  if (url.includes(PLACEHOLDER_URL) || key === PLACEHOLDER_KEY) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}
