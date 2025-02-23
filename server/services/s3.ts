import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
});

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'video/mp4',
  'video/webm',
  'image/jpeg',
  'image/png'
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export async function uploadToS3(
  file: Express.Multer.File,
  courseId: number
): Promise<string> {
  if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    throw new Error('Invalid file type');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large');
  }

  const key = `courses/${courseId}/${Date.now()}-${file.originalname}`;
  
  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}
