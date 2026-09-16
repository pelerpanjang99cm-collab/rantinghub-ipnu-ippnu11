import { basicAuth, getCloudinaryCredentials, friendlyCloudinaryError } from './_shared';

type CloudinaryResource = { public_id?: string; secure_url?: string; created_at?: string };

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method tidak diizinkan.' });
  }
  try {
    const credentials = getCloudinaryCredentials();
    const prefix = 'rantinghub-galeri/';
    const params = new URLSearchParams({ prefix, max_results: '500' });
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(credentials.cloud_name)}/resources/image/upload?${params.toString()}`,
      { headers: { Authorization: basicAuth(credentials.api_key, credentials.api_secret) } },
    );
    const result = await response.json() as {
      resources?: CloudinaryResource[];
      error?: { message?: string };
    };
    if (!response.ok) throw new Error(result.error?.message ?? `Cloudinary gallery gagal (${response.status}).`);

    const albums = new Map<string, {
      title: string; kind: string; createdAt: string;
      photos: Array<{ url: string; createdAt: string }>;
    }>();

    for (const resource of result.resources ?? []) {
      const publicId = String(resource.public_id ?? '');
      const secureUrl = String(resource.secure_url ?? '');
      if (!publicId.startsWith(prefix) || !secureUrl) continue;
      const relative = publicId.slice(prefix.length);
      const separator = relative.indexOf('/');
      if (separator < 1) continue;
      const folder = relative.slice(0, separator);
      const isEvent = folder.startsWith('kegiatan-');
      const isManual = folder.startsWith('album-');
      const rawTitle = folder.replace(/^(kegiatan|album)-/, '').replace(/-/g, ' ').trim();
      const title = rawTitle ? rawTitle.replace(/\b\w/g, c => c.toUpperCase()) : 'Galeri Ranting';
      const kind = isEvent ? 'Album Kegiatan' : isManual ? 'Album Manual' : 'Galeri Ranting';
      const createdAt = resource.created_at ?? '';
      const current = albums.get(folder) ?? { title, kind, createdAt, photos: [] };
      current.createdAt = current.createdAt && createdAt
        ? (current.createdAt > createdAt ? current.createdAt : createdAt)
        : current.createdAt || createdAt;
      current.photos.push({ url: secureUrl, createdAt });
      albums.set(folder, current);
    }

    const payload = Array.from(albums.values())
      .map(album => ({ ...album, photos: album.photos.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return res.status(200).json({ albums: payload });
  } catch (error) {
    console.error('Public Cloudinary gallery failed', error);
    return res.status(500).json({ message: friendlyCloudinaryError(error) });
  }
}
