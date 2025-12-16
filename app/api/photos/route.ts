import { NextResponse } from 'next/server';

// Cache for 1 hour
export const revalidate = 3600;

export async function GET() {
  try {
    // TODO: Implement Google Photos API integration
    // For now, return mock data with placeholder images
    const mockPhotos = {
      photos: [
        {
          id: '1',
          url: 'https://picsum.photos/seed/1/800/600',
          alt: 'Photo 1',
        },
        {
          id: '2',
          url: 'https://picsum.photos/seed/2/800/600',
          alt: 'Photo 2',
        },
        {
          id: '3',
          url: 'https://picsum.photos/seed/3/800/600',
          alt: 'Photo 3',
        },
        {
          id: '4',
          url: 'https://picsum.photos/seed/4/800/600',
          alt: 'Photo 4',
        },
      ],
    };

    return NextResponse.json(mockPhotos);
  } catch (error) {
    console.error('Photos API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}
