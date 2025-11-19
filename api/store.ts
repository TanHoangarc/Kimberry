import { put, list } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CRITICAL: Prevent Vercel Edge/Browser caching of this API response
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const key = req.query.key as string || (req.body && req.body.key);

  if (!key) {
    return res.status(400).json({ error: 'Key is required' });
  }

  const filePath = `db/${key}.json`;

  // Handle GET request: Retrieve data
  if (req.method === 'GET') {
    try {
      // List to find the file url
      const { blobs } = await list({ prefix: filePath, limit: 1 });
      
      if (blobs.length === 0) {
        return res.status(200).json(null); 
      }

      // CRITICAL: Add a timestamp query param to the blob URL fetch.
      // This forces the internal fetch to bypass the CDN cache and get the latest file.
      const response = await fetch(`${blobs[0].url}?t=${Date.now()}`);
      
      if (!response.ok) {
          return res.status(200).json(null);
      }
      
      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      console.error('Store GET error:', error);
      return res.status(500).json({ error: 'Failed to retrieve data' });
    }
  }

  // Handle POST request: Save data
  if (req.method === 'POST') {
    try {
      const { data } = req.body;
      // Overwrite the file with new data
      // addRandomSuffix: false ensures we keep the file name clean/predictable, 
      // though Vercel Blob effectively versions it.
      await put(filePath, JSON.stringify(data), { 
        access: 'public', 
        addRandomSuffix: false 
      });
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Store POST error:', error);
      return res.status(500).json({ error: 'Failed to save data' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}