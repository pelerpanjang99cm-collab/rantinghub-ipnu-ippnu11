import { createHash } from 'node:crypto';

const SUPABASE_URL = 'https://mwunxbhbdwzwkrmntxth.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_nAX-11lvLv9MJQs1b0chYA_G5SyqqFb';
const ADMIN_USER_ID = '1a6a6793-e62d-4e82-a166-9f3c5470e3b7';

type CloudinaryCredentials = { cloud_name: string; api_key: string; api_secret: string };

export async function requireAdmin(accessToken: unknown) {
  if (typeof accessToken !== 'string' || !accessToken) {
    throw new Error('Sesi pengurus tidak ditemukan. Silakan login kembali.');
  }
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error('Sesi login tidak valid. Silakan login kembali.');
  const user = await response.json() as { id?: string };
  if (user.id !== ADMIN_USER_ID) throw new Error('Akses upload galeri ditolak.');
}

export function getCloudinaryCredentials(): CloudinaryCredentials {
  const raw = process.env.CLOUDINARY_CREDENTIALS;
  if (!raw) throw new Error('CLOUDINARY_CREDENTIALS belum dikonfigurasi.');
  const parsed = JSON.parse(raw) as Partial<CloudinaryCredentials>;
  if (!parsed.cloud_name || !parsed.api_key || !parsed.api_secret) {
    throw new Error('Konfigurasi Cloudinary belum lengkap.');
  }
  return parsed as CloudinaryCredentials;
}

export function basicAuth(apiKey: string, apiSecret: string) {
  return `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`;
}

export function signCloudinaryParams(params: Record<string, string>, apiSecret: string) {
  const serialized = Object.entries(params)
    .filter(([, value]) => value !== '' && value !== undefined && value !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  return createHash('sha1').update(`${serialized}${apiSecret}`).digest('hex');
}

export function slugify(value: string) {
  const normalized = value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  return normalized.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70) || 'album';
}

export function getCloudinaryPublicId(value: string) {
  const url = new URL(value);
  const marker = '/image/upload/';
  const markerIndex = url.pathname.indexOf(marker);
  if (markerIndex < 0) throw new Error('URL foto Cloudinary tidak valid.');
  let publicPath = url.pathname.slice(markerIndex + marker.length).replace(/^v\d+\//, '');
  publicPath = publicPath.replace(/\.[a-z0-9]+$/i, '');
  if (!publicPath) throw new Error('ID foto Cloudinary tidak ditemukan.');
  return decodeURIComponent(publicPath);
}

export function friendlyCloudinaryError(value: unknown) {
  const message = value instanceof Error ? value.message : String(value);
  if (message.includes('CLOUDINARY_CREDENTIALS')) return 'Cloudinary belum dikonfigurasi di Vercel Environment Variables.';
  if (message.includes('401') || message.includes('Invalid API')) return 'Kredensial Cloudinary ditolak. Periksa Cloud Name, API Key, dan API Secret.';
  if (message.includes('400')) return 'Permintaan ke Cloudinary tidak valid. Periksa konfigurasi galeri.';
  return message;
}
