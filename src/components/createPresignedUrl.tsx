import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface S3ObjectDetails {
  bucketName: string;
  objectKeys: string[];
}

const s3Client = new S3Client({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

export async function createPresignedUrl(details: S3ObjectDetails) {
  const urlPromises = details.objectKeys.map((key) => {
    const command = new GetObjectCommand({
      Bucket: details.bucketName,
      Key: key,
    });
    return getSignedUrl(s3Client, command, { expiresIn: 3600 });
  });

  try {
    const url = await await Promise.all(urlPromises);
    return url;
  } catch (error) {
    console.error("Error creating pre-signed URL:", error);
    return null;
  }
}
