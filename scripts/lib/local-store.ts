import * as fs from 'fs';
import * as path from 'path';

import { STORE_DIR } from './constants.ts';

export async function downloadJSON<T>(key: string): Promise<T | null> {
  const filePath = path.join(STORE_DIR, key);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

export async function uploadJSON(key: string, data: unknown): Promise<void> {
  const filePath = path.join(STORE_DIR, key);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
