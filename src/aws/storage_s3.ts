import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl as getPresignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
});

// Upload a file to S3
export const upload = async (
  bucket: string,
  key: string,
  body: Buffer | ArrayBuffer | Uint8Array,
  contentType: string
): Promise<void> => {
  const fileBody = Buffer.isBuffer(body) ? body : Buffer.from(body as ArrayBuffer);
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fileBody,
      ContentType: contentType,
    }),
  );
};

// Generate a signed URL for a file in S3
export const getSignedUrl = async (
  bucket: string,
  key: string,
  expiresInSeconds: number
): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  return await getPresignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
};

// Get the public S3 URL of a file
export const getPublicUrl = (bucket: string, key: string): string => {
  const region = process.env.AWS_REGION || "us-east-1";
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};

// Create the target S3 bucket if it does not already exist
export const createBucketIfNotExists = async (bucket: string): Promise<void> => {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: bucket }));
  } catch (err: any) {
    // If bucket does not exist, create it
    if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
      console.log(`[info] Bucket ${bucket} does not exist, creating...`);
      await s3Client.send(new CreateBucketCommand({ Bucket: bucket }));
    } else {
      throw err;
    }
  }
};
