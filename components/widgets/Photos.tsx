'use client';

import React from 'react';

/**
 * Photos Widget Placeholder
 *
 * Simplified placeholder showing "Photos Coming Soon"
 * Uses theme CSS variables for styling
 */
export default function Photos() {
  return (
    <div
      className="h-full flex flex-col items-center justify-center p-6 rounded-lg backdrop-blur-theme"
      style={{
        background: 'var(--theme-photos-bg)',
        color: 'var(--theme-photos-text)',
        borderRadius: 'var(--theme-border-radius)',
        opacity: 'var(--theme-widget-opacity)',
        border: '1px solid var(--theme-photos-border)',
      }}
    >
      <div className="text-center space-y-3">
        <div className="text-5xl mb-2">📷</div>
        <h3 className="text-2xl font-bold">Photos</h3>
        <p className="text-lg opacity-70">Coming Soon</p>
      </div>
    </div>
  );
}
