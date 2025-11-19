import { put, list } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CRITICAL: Prevent Vercel Edge/Browser caching of this API response
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Handle body parsing manually if needed (sometimes Vercel passes it as string)
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      // If parsing fails, body remains a string or whatever it was
    }
  }

  const key = req.query.key as string || (body && body.key);
  // Allow passing a direct URL to bypass list() latency
  const directUrl = req.query.url as string;

  if (!key) {
    return res.status(400).json({ error: 'Key parameter is required (in query or body).' });
  }

  const filePath = `db/${key}.json`;

  // Handle GET request: Retrieve data
  if (req.method === 'GET') {
    try {
      let url = directUrl;
      
      // If no direct URL provided, try to find it via listing
      if (!url) {
        const { blobs } = await list({ prefix: filePath, limit: 1 });
        if (blobs.length > 0) {
            url = blobs[0].url;
        }
      }

      if (!url) {
        // No file found
        return res.status(200).json({ data: null, url: null }); 
      }

      // CRITICAL: Add a timestamp query param to the blob URL fetch.
      // This forces the internal fetch to bypass the CDN cache and get the latest file.
      const response = await fetch(`${url}?t=${Date.now()}`, { 
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (!response.ok) {
          return res.status(200).json({ data: null, url: null });
      }
      
      const data = await response.json();
      
      // Return both data and the URL so the client can cache the URL for next time
      return res.status(200).json({ data, url });
    } catch (error) {
      console.error('Store GET error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ error: 'Failed to retrieve data', details: errorMessage });
    }
  }

  // Handle POST request: Save data
  if (req.method === 'POST') {
    try {
      if (!body) {
          return res.status(400).json({ error: 'Request body is empty.' });
      }

      const data = body.data;
      
      if (data === undefined) {
          return res.status(400).json({ error: 'Data field is missing in request body.' });
      }

      // Overwrite the file with new data.
      // addRandomSuffix: false ensures the path remains consistent.
      const blob = await put(filePath, JSON.stringify(data), { 
        access: 'public', 
        addRandomSuffix: false,
        // Ensure content type is set correctly for the blob
        contentType: 'application/json'
      });
      
      // Return success and the specific URL of the blob
      return res.status(200).json({ success: true, url: blob.url });
    } catch (error) {
      console.error('Store POST error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ error: 'Failed to save data to Vercel Blob', details: errorMessage });
    }
  }

  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}