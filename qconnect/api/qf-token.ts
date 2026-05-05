import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, grant_type, refresh_token } = req.body;

  // Use the PRODUCTION keys (Check all possible env var naming conventions)
  const CLIENT_ID = process.env.QF_CLIENT_ID || 
                    process.env.CLIENT_ID || 
                    process.env.VITE_QURAN_CLIENT_ID || 
                    '39bc324a-e43d-4666-9b76-ff022d2169c6';

  const CLIENT_SECRET = process.env.QF_CLIENT_SECRET || 
                        process.env.CLIENT_SECRET || 
                        process.env.VITE_QURAN_CLIENT_SECRET || 
                        'GbH8iQ5Gmy8vzWlS.r58zRnlo';

  const REDIRECT_URI = 'https://qconnect-nine.vercel.app/callback';

  console.log(`[API] OAuth Attempt: ClientID=${CLIENT_ID.substring(0, 8)}... SecretProvided=${!!CLIENT_SECRET}`);

  try {
    const params = new URLSearchParams();
    
    if (grant_type === 'refresh_token') {
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', refresh_token);
    } else {
      params.append('grant_type', 'authorization_code');
      params.append('code', code);
      params.append('redirect_uri', REDIRECT_URI);
    }
    
    // Using the whitelisted scope
    params.append('scope', 'openid bookmark');

    const response = await fetch('https://oauth2.quran.foundation/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
      },
      body: params.toString(), // Ensure body is sent as a string
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('[API] Quran.foundation rejected the request:', data);
    }

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('[API] Server Error:', error);
    return res.status(500).json({ error: 'Internal server error during token exchange' });
  }
}
