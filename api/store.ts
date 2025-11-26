
import { put, list } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Ensure CORS headers to prevent browser blocking
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Prevent Caching on the API response itself
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    const action = req.query.action as string;
    let body = req.body;

    // --- HANDLE LIST ACTION (GET & POST) ---
    // Combined logic for listing files
    if ((req.method === 'GET' && action === 'list') || (req.method === 'POST' && body && body.action === 'list')) {
        const { blobs } = await list({ limit: 1000 });
        return res.status(200).json({ files: blobs });
    }

    // --- STANDARD STORE LOGIC ---
    if (typeof body === 'string') {
        try {
        body = JSON.parse(body);
        } catch (e) {
        console.error('JSON Parse Error in Store API:', e);
        }
    }

    const key = req.query.key as string || (body && typeof body === 'object' && body.key);
    const directUrl = req.query.url as string;

    // --- GET DATA ---
    if (req.method === 'GET') {
        if (!key && !directUrl) {
            return res.status(400).json({ error: 'Missing "key" or "url" parameter.' });
        }

        let url = directUrl;
        
        // Strategy: Always find the latest file from the server list to ensure cross-device consistency
        // even if the client provided a URL (the client URL might be stale).
        // Since we are moving to fixed filenames, looking up by prefix is safer.
        const prefix = `db/${key}`;
        const { blobs } = await list({ prefix, limit: 100 });
        
        // Sort by uploadedAt descending (newest first) to get the most recent overwrite
        const sortedBlobs = blobs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
        
        if (sortedBlobs.length > 0) {
            url = sortedBlobs[0].url;
        }

        if (!url) {
            // Return null data if no file found, to indicate empty DB
            return res.status(200).json({ data: null, url: null }); 
        }

        const response = await fetch(`${url}?t=${Date.now()}`, { 
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (!response.ok) {
             // If the file url is stale (deleted), return null so client can create new
            return res.status(200).json({ data: null, url: null });
        }
        
        const data = await response.json();
        return res.status(200).json({ data, url });
    }

    // --- POST DATA ---
    if (req.method === 'POST') {
        if (!key) {
            return res.status(400).json({ error: 'Missing "key" parameter.' });
        }

        if (!body || typeof body !== 'object') {
            return res.status(400).json({ error: 'Invalid JSON body.' });
        }

        const data = body.data;
        if (data === undefined) {
            return res.status(400).json({ error: 'Missing "data" field.' });
        }

        const filePath = `db/${key}.json`;

        const blob = await put(filePath, JSON.stringify(data), { 
            access: 'public', 
            // IMPORTANT: Set addRandomSuffix to FALSE to ensure we overwrite the same file.
            // This acts as a "Single Source of Truth" so all devices look at the same filename.
            addRandomSuffix: false, 
            contentType: 'application/json',
            // @ts-ignore: Vercel Blob requires this flag
            allowOverwrite: true,
            // CRITICAL: Tell Vercel Edge Cache to NOT cache this file. 
            // This ensures Machine B gets the update immediately.
            cacheControlMaxAge: 0, 
        });
        
        return res.status(200).json({ success: true, url: blob.url });
    }

    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });

  } catch (error) {
    console.error('API Store Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: 'Internal Server Error', details: errorMessage });
  }
}
