import type { Readable } from "node:stream";
import {
	CopyObjectCommand,
	CreateBucketCommand,
	DeleteBucketCommand,
	DeleteObjectCommand,
	GetObjectCommand,
	HeadObjectCommand,
	ListBucketsCommand,
	ListObjectsV2Command,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export interface SealosS3Config {
	accessKeyId: string;
	secretAccessKey: string;
	region?: string;
	endpoint: string;
}

export interface UploadOptions {
	contentType?: string;
	metadata?: Record<string, string>;
	acl?: "private" | "public-read" | "public-read-write";
}

export interface ListOptions {
	prefix?: string;
	maxKeys?: number;
	continuationToken?: string;
}

export interface FileInfo {
	key: string;
	size: number;
	lastModified: Date;
	url: string;
}

export class S3Error extends Error {
	constructor(
		message: string,
		public operation: string,
		public originalError?: unknown,
	) {
		super(message);
		this.name = "S3Error";
	}
}

function handleError(error: unknown, operation: string): never {
	const message =
		error instanceof Error ? error.message : "Unknown error occurred";
	throw new S3Error(`S3 ${operation} failed: ${message}`, operation, error);
}

const validateConfig = (config: SealosS3Config): void => {
	if (!config.accessKeyId || config.accessKeyId.trim() === "") {
		throw new S3Error("accessKeyId is required", "validation");
	}
	if (!config.secretAccessKey || config.secretAccessKey.trim() === "") {
		throw new S3Error("secretAccessKey is required", "validation");
	}
	if (!config.endpoint || config.endpoint.trim() === "") {
		throw new S3Error("endpoint is required", "validation");
	}
};

const createS3Client = (config: SealosS3Config): S3Client => {
	validateConfig(config);

	return new S3Client({
		region: config.region || "us-east-1",
		credentials: {
			accessKeyId: config.accessKeyId,
			secretAccessKey: config.secretAccessKey,
		},
		endpoint: `https://${config.endpoint}`,
		forcePathStyle: true,
	});
};

const formatBucketName = (accessKeyId: string, bucketName: string): string => {
	const prefix = `${accessKeyId}-`;

	if (bucketName.startsWith(prefix)) {
		return bucketName;
	}

	return `${prefix}${bucketName}`;
};

export const testS3Connection = async (
	config: SealosS3Config,
): Promise<boolean> => {
	const client = createS3Client(config);

	try {
		await client.send(new ListBucketsCommand({}));
		return true;
	} catch (error) {
		handleError(error, "connection test");
	} finally {
		client.destroy();
	}
};

export const listS3Buckets = async (
	config: SealosS3Config,
): Promise<string[]> => {
	const client = createS3Client(config);

	try {
		const response = await client.send(new ListBucketsCommand({}));
		const prefix = `${config.accessKeyId}-`;

		const userBuckets =
			response.Buckets?.filter((bucket) => bucket.Name?.startsWith(prefix)).map(
				(bucket) => bucket.Name!,
			) || [];

		return userBuckets;
	} catch (error) {
		handleError(error, "list buckets");
	} finally {
		client.destroy();
	}
};

export const createS3Bucket = async (
	config: SealosS3Config,
	customName: string,
): Promise<string> => {
	const client = createS3Client(config);
	const bucketName = formatBucketName(config.accessKeyId, customName);

	try {
		await client.send(
			new CreateBucketCommand({
				Bucket: bucketName,
			}),
		);
		return bucketName;
	} catch (error) {
		handleError(error, "create bucket");
	} finally {
		client.destroy();
	}
};

export const deleteS3Bucket = async (
	config: SealosS3Config,
	customName: string,
): Promise<void> => {
	const client = createS3Client(config);
	const bucketName = formatBucketName(config.accessKeyId, customName);

	try {
		await client.send(
			new DeleteBucketCommand({
				Bucket: bucketName,
			}),
		);
	} catch (error) {
		handleError(error, "delete bucket");
	} finally {
		client.destroy();
	}
};

export const uploadS3File = async (
	config: SealosS3Config,
	customBucketName: string,
	key: string,
	body: Buffer | Readable | string,
	options?: UploadOptions,
): Promise<string> => {
	const client = createS3Client(config);
	const bucketName = formatBucketName(config.accessKeyId, customBucketName);

	try {
		await client.send(
			new PutObjectCommand({
				Bucket: bucketName,
				Key: key,
				Body: body,
				ContentType: options?.contentType,
				Metadata: options?.metadata,
				ACL: options?.acl,
			}),
		);

		return `https://${config.endpoint}/${bucketName}/${key}`;
	} catch (error) {
		handleError(error, "upload file");
	} finally {
		client.destroy();
	}
};

export const downloadS3File = async (
	config: SealosS3Config,
	customBucketName: string,
	key: string,
): Promise<Readable> => {
	const client = createS3Client(config);
	const bucketName = formatBucketName(config.accessKeyId, customBucketName);

	try {
		const response = await client.send(
			new GetObjectCommand({
				Bucket: bucketName,
				Key: key,
			}),
		);

		if (!response.Body) {
			throw new Error("File body is empty");
		}

		return response.Body as Readable;
	} catch (error) {
		handleError(error, "download file");
	} finally {
		client.destroy();
	}
};

export const deleteS3File = async (
	config: SealosS3Config,
	customBucketName: string,
	key: string,
): Promise<void> => {
	const client = createS3Client(config);
	const bucketName = formatBucketName(config.accessKeyId, customBucketName);

	try {
		await client.send(
			new DeleteObjectCommand({
				Bucket: bucketName,
				Key: key,
			}),
		);
	} catch (error) {
		handleError(error, "delete file");
	} finally {
		client.destroy();
	}
};

export const listS3Files = async (
	config: SealosS3Config,
	customBucketName: string,
	options?: ListOptions,
): Promise<FileInfo[]> => {
	const client = createS3Client(config);
	const bucketName = formatBucketName(config.accessKeyId, customBucketName);

	try {
		const response = await client.send(
			new ListObjectsV2Command({
				Bucket: bucketName,
				Prefix: options?.prefix,
				MaxKeys: options?.maxKeys,
				ContinuationToken: options?.continuationToken,
			}),
		);

		const files =
			response.Contents?.map((obj) => ({
				key: obj.Key!,
				size: obj.Size!,
				lastModified: obj.LastModified!,
				url: `https://${config.endpoint}/${bucketName}/${obj.Key}`,
			})) || [];

		return files;
	} catch (error) {
		handleError(error, "list files");
	} finally {
		client.destroy();
	}
};

export const checkS3FileExists = async (
	config: SealosS3Config,
	customBucketName: string,
	key: string,
): Promise<boolean> => {
	const client = createS3Client(config);
	const bucketName = formatBucketName(config.accessKeyId, customBucketName);

	try {
		await client.send(
			new HeadObjectCommand({
				Bucket: bucketName,
				Key: key,
			}),
		);
		return true;
	} catch (error) {
		if (error instanceof Error && error.name === "NotFound") {
			return false;
		}
		throw error;
	} finally {
		client.destroy();
	}
};

/**
 * Copy a file in S3
 */
export const copyS3File = async (
	config: SealosS3Config,
	sourceBucket: string,
	sourceKey: string,
	destBucket: string,
	destKey: string,
): Promise<string> => {
	const client = createS3Client(config);
	const sourceBucketName = formatBucketName(config.accessKeyId, sourceBucket);
	const destBucketName = formatBucketName(config.accessKeyId, destBucket);

	try {
		await client.send(
			new CopyObjectCommand({
				CopySource: `${sourceBucketName}/${sourceKey}`,
				Bucket: destBucketName,
				Key: destKey,
			}),
		);

		return `https://${config.endpoint}/${destBucketName}/${destKey}`;
	} catch (error) {
		handleError(error, "copy file");
	} finally {
		client.destroy();
	}
};

export const getS3PresignedUrl = async (
	config: SealosS3Config,
	customBucketName: string,
	key: string,
	expiresIn: number = 3600,
): Promise<string> => {
	const client = createS3Client(config);
	const bucketName = formatBucketName(config.accessKeyId, customBucketName);

	try {
		const command = new GetObjectCommand({
			Bucket: bucketName,
			Key: key,
		});

		const url = await getSignedUrl(client as any, command, { expiresIn });
		return url;
	} catch (error) {
		handleError(error, "generate presigned URL");
	} finally {
		client.destroy();
	}
};

export const getS3PublicUrl = (
	config: SealosS3Config,
	customBucketName: string,
	key: string,
): string => {
	const bucketName = formatBucketName(config.accessKeyId, customBucketName);
	return `https://${config.endpoint}/${bucketName}/${key}`;
};
