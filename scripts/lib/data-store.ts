import { downloadJSON as localDownload, uploadJSON as localUpload } from './local-store.ts';
import { downloadJSON as r2Download, uploadJSON as r2Upload } from './r2.ts';

type Backend = 'local' | 'r2';

function getBackend(): Backend {
  const value = process.env.DATA_STORE;

  if (value !== 'local' && value !== 'r2') {
    throw new Error("DATA_STORE must be set to 'local' or 'r2' (see .env.example)");
  }

  return value;
}

export async function downloadJSON<T>(key: string): Promise<T | null> {
  return getBackend() === 'local' ? localDownload<T>(key) : r2Download<T>(key);
}

export async function uploadJSON(key: string, data: unknown): Promise<void> {
  return getBackend() === 'local' ? localUpload(key, data) : r2Upload(key, data);
}
