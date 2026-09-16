import { basicAuth, getCloudinaryCredentials, friendlyCloudinaryError } from './_shared';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method tidak diizinkan.' });
  }
  try {
    const credentials = getCloudinaryCredentials();
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(credentials.cloud_name)}/ping`,
      { headers: { Authorization: basicAuth(credentials.api_key, credentials.api_secret) } },
    );
    if (!response.ok) throw new Error(`Cloudinary status ${response.status}`);
    return res.status(200).json({ configured: true, cloudName: credentials.cloud_name });
  } catch (error) {
    return res.status(200).json({ configured: false, message: friendlyCloudinaryError(error) });
  }
}
