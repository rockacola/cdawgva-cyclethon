import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

function createR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY must be set');
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function getBucket(): string {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) {
    throw new Error('R2_BUCKET_NAME must be set');
  }
  return bucket;
}

export async function downloadJSON<T>(key: string): Promise<T | null> {
  const client = createR2Client();
  const bucket = getBucket();

  try {
    const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const body = await response.Body?.transformToString();
    if (!body) {
      return null;
    }
    return JSON.parse(body) as T;
  } catch (err: unknown) {
    if ((err as { name?: string }).name === 'NoSuchKey') {
      return null;
    }
    throw err;
  }
}

export async function uploadJSON(key: string, data: unknown): Promise<void> {
  const client = createR2Client();
  const bucket = getBucket();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: JSON.stringify(data, null, 2),
      ContentType: 'application/json',
    }),
  );
}
