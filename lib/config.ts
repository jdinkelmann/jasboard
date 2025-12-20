import fs from 'fs/promises';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'config.json');

export interface AppConfig {
  theme?: 'default' | 'epaper' | 'wood' | 'dashboard';
  backgroundImageUrl?: string;
  calendarIds: string[];
  photoAlbumIds: string[];
  selectedPhotos?: { id: string; url: string; alt: string; mimeType?: string }[];
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
  googleTokens?: {
    access_token: string;
    refresh_token: string;
    expiry_date: number;
  };
  reloadRequested?: boolean;
}

const defaultConfig: AppConfig = {
  calendarIds: [],
  photoAlbumIds: [],
  selectedPhotos: [],
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

export async function readConfig(): Promise<AppConfig> {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf-8');

    // Handle empty file or whitespace-only content
    if (!data || data.trim() === '') {
      await initializeConfig();
      return defaultConfig;
    }

    const config = JSON.parse(data);
    return { ...defaultConfig, ...config };
  } catch (error) {
    // If file doesn't exist or has invalid JSON, initialize with defaults
    if (
      (error as NodeJS.ErrnoException).code === 'ENOENT' ||
      error instanceof SyntaxError
    ) {
      await initializeConfig();
      return defaultConfig;
    }
    throw error;
  }
}

async function initializeConfig(): Promise<void> {
  try {
    await fs.writeFile(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to initialize config file:', error);
  }
}

export async function writeConfig(config: Partial<AppConfig>): Promise<void> {
  const currentConfig = await readConfig();
  const newConfig = { ...currentConfig, ...config };
  await fs.writeFile(CONFIG_FILE, JSON.stringify(newConfig, null, 2), 'utf-8');
}

export async function updateConfig(config: Partial<AppConfig>): Promise<void> {
  await writeConfig(config);
}

export async function updateGoogleTokens(tokens: AppConfig['googleTokens']): Promise<void> {
  await writeConfig({ googleTokens: tokens });
}

export async function getGoogleTokens(): Promise<AppConfig['googleTokens'] | undefined> {
  const config = await readConfig();
  return config.googleTokens;
}
