import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { config, payload } = req.body;

  if (!config || !config.accessToken) {
    return res.status(400).json({
      success: false,
      error: "Zalo access token is required.",
    });
  }

  try {
    const zaloUrl = "https://openapi.zalo.me/v2.0/oa/message";
    const response = await fetch(zaloUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access_token": config.accessToken,
      },
      body: JSON.stringify({
        recipient: payload.recipient,
        template_id: payload.template_id,
        template_data: payload.template_data,
      }),
    });

    const resJson = await response.json();
    return res.json({
      success: true,
      data: resJson,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to establish connect to Zalo OpenAPI",
    });
  }
}
