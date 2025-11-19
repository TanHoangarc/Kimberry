import { put, list } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const key = req.query.key as string || (req.body && req.body.key);

  if (!key) {
    return res.status(400).json({ error: 'Key is required' });
  }

  const filePath = `db/${key}.json`;

  // Handle GET request: Retrieve data
  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: filePath, limit: 1 });
      
      if (blobs.length === 0) {
        return res.status(200).json(null); 
      }

      const response = await fetch(blobs[0].url);
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