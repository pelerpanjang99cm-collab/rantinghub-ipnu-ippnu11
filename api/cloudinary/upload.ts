import { randomUUID } from 'node:crypto';
import { friendlyCloudinaryError, getCloudinaryCredentials, requireAdmin, signCloudinaryParams, slugify } from './_shared';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method tidak diizinkan.' });
  }
  try {
    const payload = req.body as {
      supabaseAccessToken?: string; fileName?: string; mimeType?: string; base64?: string; albumName?: string;
    };
    await requireAdmin(payload?.supabaseAccessToken);
    if (!payload?.fileName || !payload?.mimeType || !payload?.base64 || !payload?.albumName) {
      return res.status(400).json({ message: 'Data upload Cloudinary belum lengkap.' });
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(payload.mimeType)) {
      return res.status(400).json({ message: 'Cloudinary galeri hanya menerima JPG, PNG, atau WebP.' });
    }
    const rawBase64 = payload.base64.replace(/^data:[^;]+;base64,/, '');
    const bytes = Buffer.from(rawBase64, 'base64');
    if (bytes.length > 5.5 * 1024 * 1024) {
      return res.status(400).json({ message: 'Foto setelah kompresi masih terlalu besar. Maksimal sekitar 5,5 MB.' });
    }

    const credentials = getCloudinaryCredentials();
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `rantinghub-galeri/${slugify(payload.albumName)}`;
    const publicId = `${folder}/${randomUUID()}`;
    const signedParams = { folder, public_id: publicId, timestamp: String(timestamp) };

    const form = new FormData();
    form.append('file', payload.base64);
    form.append('api_key', credentials.api_key);
    form.append('timestamp', String(timestamp));
    form.append('folder', folder);
    form.append('public_id', publicId);
    form.append('signature', signCloudinaryParams(signedParams, credentials.api_secret));

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(credentials.cloud_name)}/image/upload`,
      { method: 'POST', body: form },
    );
    const result = await response.json() as { secure_url?: string; public_id?: string; error?: { message?: string } };
    if (!response.ok || !result.secure_url) {
      throw new Error(result.error?.message ?? `Cloudinary upload gagal (${response.status}).`);
    }
    return res.status(200).json({ url: result.secure_url, publicId: result.public_id ?? publicId });
  } catch (error) {
    console.error('Cloudinary upload failed', error);
    return res.status(500).json({ message: friendlyCloudinaryError(error) });
  }
}
