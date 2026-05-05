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
    
    // Some providers require credentials in the body AND/OR the header
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);

    const authHeader = `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`;

    console.log("[DEBUG OAuth]", {
      clientId: CLIENT_ID,
      hasSecret: !!CLIENT_SECRET,
      secretLength: CLIENT_SECRET?.length,
      authHeaderPreview: authHeader?.slice(0, 18), // safe preview
    });

    const response = await fetch('https://oauth2.quran.foundation/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': authHeader,
      },
      body: params.toString(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('[API] Quran.foundation rejected the request:', data);
      console.log(`[API] Debug Info: Grant=${grant_type || 'auth_code'} ID=${CLIENT_ID.substring(0, 8)}...`);
    }

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('[API] Server Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
