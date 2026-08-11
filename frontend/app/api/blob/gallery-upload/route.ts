import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const ALLOWED_GALLERY_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_GALLERY_UPLOAD_BYTES = 25 * 1024 * 1024;

type GalleryUploadPayload = {
  projectId?: number;
};

function parseClientPayload(clientPayload: string | null): GalleryUploadPayload {
  if (!clientPayload) {
    throw new Error('Missing upload metadata');
  }

  const payload = JSON.parse(clientPayload) as GalleryUploadPayload;
  if (!Number.isInteger(payload.projectId) || Number(payload.projectId) <= 0) {
    throw new Error('Invalid project ID');
  }
  return payload;
}

async function verifyAdmin(request: Request): Promise<void> {
  const authorization = request.headers.get('authorization');
  if (!authorization) {
    throw new Error('Missing admin authorization');
  }

  const response = await fetch(`${API_URL}/auth/verify`, {
    headers: { Authorization: authorization },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Invalid admin authorization');
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as HandleUploadBody;
    const response = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        await verifyAdmin(request);
        const payload = parseClientPayload(clientPayload);
        const expectedPrefix = `project-gallery/${payload.projectId}/`;

        if (!pathname.startsWith(expectedPrefix)) {
          throw new Error('Invalid upload path');
        }

        return {
          allowedContentTypes: ALLOWED_GALLERY_IMAGE_TYPES,
          maximumSizeInBytes: MAX_GALLERY_UPLOAD_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ projectId: payload.projectId }),
        };
      },
    });

    return NextResponse.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to prepare gallery upload';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
