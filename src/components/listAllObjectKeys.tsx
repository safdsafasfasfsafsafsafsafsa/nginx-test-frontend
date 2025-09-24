import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

export async function listAllObjectKeys(bucketName: string): Promise<string[]> {
  const allKeys: string[] = [];
  let isTruncated = true;
  let nextContinuationToken: string | undefined = undefined;

  // map 위해 모든 키 이름 가져오기
  while (isTruncated) {
    const command: ListObjectsV2Command = new ListObjectsV2Command({
      Bucket: bucketName,
      ContinuationToken: nextContinuationToken,
    });
    const { Contents, IsTruncated, NextContinuationToken } =
      await s3Client.send(command);

    if (Contents) {
      allKeys.push(
        ...(Contents.map((obj) => obj.Key).filter(
          (key) => key !== undefined
        ) as string[])
      );
    }

    isTruncated = IsTruncated ?? false;
    nextContinuationToken = NextContinuationToken;
  }
  return allKeys;
}
