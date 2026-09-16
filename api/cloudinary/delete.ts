import { friendlyCloudinaryError, getCloudinaryCredentials, getCloudinaryPublicId, requireAdmin, signCloudinaryParams } from './_shared';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method tidak diizinkan.' });
  }
  try {
    const payload = req.body as { supabaseAccessToken?: string; url?: string };
    await requireAdmin(payload?.supabaseAccessToken);
    if (!payload?.url) return res.status(400).json({ message: 'URL foto Cloudinary tidak ditemukan.' });

    const credentials = getCloudinaryCredentials();
    const publicId = getCloudinaryPublicId(payload.url);
    const timestamp = Math.floor(Date.now() / 1000);
    const signedParams = { invalidate: 'true', public_id: publicId, timestamp: String(timestamp) };

    const form = new FormData();
    form.append('public_id', publicId);
    form.append('timestamp', String(timestamp));
    form.append('invalidate', 'true');
    form.append('signature', signCloudinaryParams(signedParams, credentials.api_secret));
    form.append('api_key', credentials.api_key);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(credentials.cloud_name)}/image/destroy`,
      { method: 'POST', body: form },
    );
    const result = await response.json() as { result?: string; error?: { message?: string } };
    if (!response.ok || result.result !== 'ok') {
      throw new Error(result.error?.message ?? `Cloudinary delete gagal (${response.status}).`);
    }
    return res.status(200).json({ deleted: true });
  } catch (error) {
    console.error('Cloudinary delete failed', error);
    return res.status(500).json({ message: friendlyCloudinaryError(error) });
  }
}
