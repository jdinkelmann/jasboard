'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import heic2any from 'heic2any';

interface Photo {
  id: string;
  url: string;
  alt: string;
  mimeType?: string;
}

export default function Photos() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [convertedPhotos, setConvertedPhotos] = useState<Map<string, string>>(new Map());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch('/api/photos');
        const data = await response.json();

        // Transform photos to use proxy URLs
        const photosWithProxy = (data.photos || []).map((photo: Photo) => ({
          ...photo,
          url: `/api/photos/proxy?url=${encodeURIComponent(photo.url)}`,
        }));

        setPhotos(photosWithProxy);
      } catch (error) {
        console.error('Failed to fetch photos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
    // Refresh photo list every hour
    const fetchInterval = setInterval(fetchPhotos, 60 * 60 * 1000);

    return () => clearInterval(fetchInterval);
  }, []);

  useEffect(() => {
    const convertHeicPhotos = async () => {
      const newConverted = new Map(convertedPhotos);

      for (const photo of photos) {
        // Check if photo is HEIC/HEIF and not already converted
        if (
          photo.mimeType?.includes('heif') ||
          photo.mimeType?.includes('heic') ||
          photo.alt?.toLowerCase().endsWith('.heic')
        ) {
          if (!newConverted.has(photo.id)) {
            try {
              // Fetch the HEIC image
              const response = await fetch(photo.url);
              const blob = await response.blob();

              // Convert to JPEG
              const convertedBlob = await heic2any({
                blob,
                toType: 'image/jpeg',
                quality: 0.9,
              });

              // Create object URL
              const blobArray = Array.isArray(convertedBlob) ? convertedBlob : [convertedBlob];
              const objectUrl = URL.createObjectURL(blobArray[0]);

              newConverted.set(photo.id, objectUrl);
            } catch (error) {
              console.error(`Failed to convert HEIC photo ${photo.id}:`, error);
            }
          }
        }
      }

      setConvertedPhotos(newConverted);
    };

    if (photos.length > 0) {
      convertHeicPhotos();
    }

    // Cleanup object URLs on unmount
    return () => {
      convertedPhotos.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photos]);

  useEffect(() => {
    if (photos.length === 0) return;

    // Rotate photos every 30 seconds
    const rotateInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 30000);

    return () => clearInterval(rotateInterval);
  }, [photos.length]);

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg overflow-hidden h-full animate-pulse">
        <div className="w-full h-full bg-gray-800"></div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg p-4 h-full flex items-center justify-center">
        <p className="text-gray-400">No photos</p>
      </div>
    );
  }

  const currentPhoto = photos[currentIndex];
  const displayUrl = convertedPhotos.get(currentPhoto.id) || currentPhoto.url;

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden h-full relative">
      <Image
        src={displayUrl}
        alt={currentPhoto.alt}
        fill
        className="object-cover"
        sizes="(max-width: 1080px) 50vw, 540px"
        unoptimized
      />
    </div>
  );
}
