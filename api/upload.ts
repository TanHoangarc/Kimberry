// api/upload.ts

// This is a Vercel Serverless Function.
// You need to install the Vercel Blob SDK: `npm install @vercel/blob`
// and types for Vercel functions: `npm install -D @vercel/node`
// Also, ensure you have connected a Blob store to your project in the Vercel dashboard.
// This will provide the necessary BLOB_READ_WRITE_TOKEN environment variable.

import { put } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// By disabling the body parser, we can stream the file directly to Vercel Blob.
// This is crucial for handling binary files like PDFs.
export const config = {
  api: {
    bodyParser: false,
  },
};


export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // We expect a POST request
  if (request.method !== 'POST') {
    response.setHeader('Allow', ['POST']);
    return response.status(405).json({ error: `Method ${request.method} Not Allowed` });
  }

  // Extract parameters from query
  const filename = request.query.filename as string;
  const jobId = request.query.jobId as string;
  const uploadPath = request.query.uploadPath as string;

  if (!filename || !jobId || !uploadPath) {
    return response.status(400).json({ error: 'Filename, JobId, and uploadPath query parameters are required.' });
  }
  
  // Whitelist allowed paths for security
  const allowedPaths = ['CVHC', 'MBL'];
  if (!allowedPaths.includes(uploadPath)) {
      return response.status(400).json({ error: 'Invalid upload path specified.' });
  }

  try {
    // Construct a unique path for the blob using the dynamic upload path
    const blobPath = `${uploadPath}/${jobId}/${filename}`;

    // Upload the file to Vercel Blob. The `request` object itself is a ReadableStream
    // containing the file data, which `put` can handle directly.
    const blob = await put(blobPath, request, {
      access: 'public', // 'public' makes the file accessible via its URL
    });

    // Return the successful response with the blob's URL
    return response.status(200).json({
        message: `File ${filename} uploaded successfully to ${uploadPath} for Job ${jobId}.`,
        url: blob.url 
    });
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return response.status(500).json({ error: 'Failed to upload file.', details: errorMessage });
  }
}