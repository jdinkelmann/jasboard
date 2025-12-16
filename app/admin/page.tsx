'use client';

import { useEffect, useState } from 'react';

interface Config {
  calendarIds: string[];
  photoAlbumIds: string[];
  weatherLocation: {
    lat: number;
    lon: number;
    name: string;
  };
  metarStation: string;
  refreshIntervals: {
    calendar: number;
    photos: number;
    weather: number;
    metar: number;
  };
}

const defaultConfig: Config = {
  calendarIds: [],
  photoAlbumIds: [],
  weatherLocation: {
    lat: 42.3601,
    lon: -71.0589,
    name: 'Boston, MA',
  },
  metarStation: 'KBOS',
  refreshIntervals: {
    calendar: 15,
    photos: 60,
    weather: 30,
    metar: 15,
  },
};

export default function AdminPage() {
  const [config, setConfig] = useState<Config>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'not_authenticated'>('checking');
  const [oauthMessage, setOauthMessage] = useState('');

  useEffect(() => {
    fetchConfig();
    checkAuthStatus();

    // Check for OAuth callback messages
    const params = new URLSearchParams(window.location.search);
    if (params.get('success')) {
      setOauthMessage('Successfully connected to Google!');
      setAuthStatus('authenticated');
      // Clean up URL
      window.history.replaceState({}, '', '/admin');
    } else if (params.get('error')) {
      setOauthMessage(`OAuth error: ${params.get('error')}`);
    }
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/config');
      if (response.ok) {
        const data = await response.json();
        setConfig({ ...defaultConfig, ...data });
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/status');
      if (response.ok) {
        const data = await response.json();
        setAuthStatus(data.authenticated ? 'authenticated' : 'not_authenticated');
      } else {
        setAuthStatus('not_authenticated');
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
      setAuthStatus('not_authenticated');
    }
  };

  const initiateGoogleOAuth = async () => {
    try {
      const response = await fetch('/api/auth/google');
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Failed to initiate OAuth:', error);
      setOauthMessage('Failed to initiate Google OAuth');
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        setMessage('Configuration saved successfully!');
      } else {
        setMessage('Failed to save configuration');
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      setMessage('Error saving configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">JasBoard Admin</h1>

        {/* Google Authentication */}
        <section className="bg-gray-800 rounded-lg p-6 mb-6 border-2 border-blue-600">
          <h2 className="text-2xl font-semibold mb-4">Google Authentication</h2>
          <div className="space-y-4">
            <p className="text-gray-300">
              Connect your Google account to access Calendar and Photos.
            </p>

            {authStatus === 'checking' && (
              <div className="text-gray-400">Checking authentication status...</div>
            )}

            {authStatus === 'not_authenticated' && (
              <div>
                <button
                  onClick={initiateGoogleOAuth}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold"
                >
                  Connect Google Account
                </button>
              </div>
            )}

            {authStatus === 'authenticated' && (
              <div className="flex items-center gap-2 text-green-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Connected to Google</span>
              </div>
            )}

            {oauthMessage && (
              <div className={`p-3 rounded ${oauthMessage.includes('Success') ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                {oauthMessage}
              </div>
            )}
          </div>
        </section>

        {/* Google Calendar */}
        <section className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Google Calendar</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Calendar IDs (one per line)
              </label>
              <textarea
                className="w-full bg-gray-700 rounded p-3 h-32"
                value={config.calendarIds.join('\n')}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    calendarIds: e.target.value.split('\n').filter((id) => id.trim()),
                  })
                }
                placeholder="primary&#10;family@group.calendar.google.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Refresh interval (minutes)
              </label>
              <input
                type="number"
                className="w-32 bg-gray-700 rounded p-2"
                value={config.refreshIntervals.calendar}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    refreshIntervals: {
                      ...config.refreshIntervals,
                      calendar: parseInt(e.target.value) || 15,
                    },
                  })
                }
              />
            </div>
          </div>
        </section>

        {/* Google Photos */}
        <section className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Google Photos</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Album IDs (one per line)
              </label>
              <textarea
                className="w-full bg-gray-700 rounded p-3 h-32"
                value={config.photoAlbumIds.join('\n')}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    photoAlbumIds: e.target.value.split('\n').filter((id) => id.trim()),
                  })
                }
                placeholder="album-id-1&#10;album-id-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Refresh interval (minutes)
              </label>
              <input
                type="number"
                className="w-32 bg-gray-700 rounded p-2"
                value={config.refreshIntervals.photos}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    refreshIntervals: {
                      ...config.refreshIntervals,
                      photos: parseInt(e.target.value) || 60,
                    },
                  })
                }
              />
            </div>
          </div>
        </section>

        {/* Weather */}
        <section className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Weather</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Location Name</label>
              <input
                type="text"
                className="w-full bg-gray-700 rounded p-2"
                value={config.weatherLocation.name}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    weatherLocation: {
                      ...config.weatherLocation,
                      name: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  className="w-full bg-gray-700 rounded p-2"
                  value={config.weatherLocation.lat}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      weatherLocation: {
                        ...config.weatherLocation,
                        lat: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  className="w-full bg-gray-700 rounded p-2"
                  value={config.weatherLocation.lon}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      weatherLocation: {
                        ...config.weatherLocation,
                        lon: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Refresh interval (minutes)
              </label>
              <input
                type="number"
                className="w-32 bg-gray-700 rounded p-2"
                value={config.refreshIntervals.weather}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    refreshIntervals: {
                      ...config.refreshIntervals,
                      weather: parseInt(e.target.value) || 30,
                    },
                  })
                }
              />
            </div>
          </div>
        </section>

        {/* METAR */}
        <section className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">METAR</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Airport Code (ICAO)</label>
              <input
                type="text"
                className="w-32 bg-gray-700 rounded p-2 uppercase"
                value={config.metarStation}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    metarStation: e.target.value.toUpperCase(),
                  })
                }
                placeholder="KBOS"
                maxLength={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Refresh interval (minutes)
              </label>
              <input
                type="number"
                className="w-32 bg-gray-700 rounded p-2"
                value={config.refreshIntervals.metar}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    refreshIntervals: {
                      ...config.refreshIntervals,
                      metar: parseInt(e.target.value) || 15,
                    },
                  })
                }
              />
            </div>
          </div>
        </section>

        {/* Save button */}
        <div className="flex items-center gap-4">
          <button
            onClick={saveConfig}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-8 py-3 rounded-lg font-semibold"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
          {message && (
            <span className={message.includes('success') ? 'text-green-400' : 'text-red-400'}>
              {message}
            </span>
          )}
        </div>

        {/* Quick links */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <a
            href="/"
            className="text-blue-400 hover:text-blue-300"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
