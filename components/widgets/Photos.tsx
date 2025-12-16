'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Photo {
  id: string;
  url: string;
  alt: string;
}

export default function Photos() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch('/api/photos');
        const data = await response.json();
        setPhotos(data.photos || []);
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

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden h-full relative">
      <Image
        src={currentPhoto.url}
        alt={currentPhoto.alt}
        fill
        className="object-cover"
        sizes="(max-width: 1080px) 50vw, 540px"
      />
    </div>
  );
}
