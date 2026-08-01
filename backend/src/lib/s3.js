import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { config } from "dotenv";

config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadToS3 = async (fileBuffer, mimeType, originalName) => {
  const extension = originalName ? originalName.split('.').pop() : '';
  const fileKey = `${crypto.randomUUID()}-${Date.now()}${extension ? '.' + extension : ''}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileKey,
    Body: fileBuffer,
    ContentType: mimeType,
    ACL: "public-read",
  });

  await s3Client.send(command);
  
  // Return the public URL or the key so we can construct the URL
  // We assume the bucket is public-read or we construct the standard S3 URL format
  const region = process.env.AWS_REGION || "us-east-1";
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  const url = `https://${bucketName}.s3.${region}.amazonaws.com/${fileKey}`;
  
  return { url, fileKey };
};

export const deleteFromS3 = async (fileKey) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileKey,
  });

  await s3Client.send(command);
};

export default s3Client;
