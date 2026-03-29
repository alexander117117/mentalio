import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: 'https://8dc784623553374b5082fbda3202841a.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: '4d01f1aad72339cb864070d2a75b925e',
    secretAccessKey: '8c13a66cc2923f3725b5fb1b71f08914e07cbf315b28ccf66ea1f993c7179235',
  },
});

const R2_PUBLIC_URL = 'https://pub-b3ad2a85bf9d4cf3b52ba5d853fa8d69.r2.dev';
const R2_BUCKET = 'mentalio-videos';

export async function uploadVideoToR2(localUri: string, courseId: string): Promise<string> {
  const ext = localUri.split('.').pop()?.toLowerCase().split('?')[0] ?? 'mp4';
  const mime = ext === 'mov' ? 'video/quicktime' : `video/${ext}`;
  const key = `${courseId}/${Date.now()}.${ext}`;

  const response = await fetch(localUri);
  const blob = await response.blob();

  await r2Client.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: blob as any,
    ContentType: mime,
  }));

  return `${R2_PUBLIC_URL}/${key}`;
}
