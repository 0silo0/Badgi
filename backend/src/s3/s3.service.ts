import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectVersionsCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class S3Service {
  private readonly s3: S3Client;
  private readonly bucketName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const endpoint = this.getRequiredConfig('AWS_ENDPOINT');
    const region = this.getRequiredConfig('AWS_REGION');
    const accessKeyId = this.getRequiredConfig('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.getRequiredConfig('AWS_SECRET_ACCESS_KEY');
    this.bucketName = this.getRequiredConfig('AWS_BUCKET_NAME');

    this.s3 = new S3Client({
      endpoint,
      region,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
    });
  }

  private getRequiredConfig(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) throw new Error(`Missing required config: ${key}`);
    return value;
  }

  private generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${randomString}-${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  }

  async generatePresignedUrl(key: string, expiresIn = 604800): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucketName, Key: key });
    return getSignedUrl(this.s3, command, { expiresIn });
  }

  async uploadAndSaveFile(
    file: Express.Multer.File,
    folder: string,
    userId?: string,
    fileType?: string,
  ) {
    if (!userId) throw new Error('User ID is required for file upload');

    const uniqueFileName = this.generateUniqueFileName(file.originalname);
    const key = `badgi/${folder}/${uniqueFileName}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    console.log(file)

    const dbFile = await this.prisma.file.create({
      data: {
        filename: file.originalname,
        path: await this.generatePresignedUrl(key),
        size: BigInt(file.size),
        mimeType: fileType || file.mimetype,
        uploadedById: userId,
        isDeleted: false,
      },
    });

    return {
      ...dbFile,
      url: await this.generatePresignedUrl(key),
      s3Key: key,
    };
  }

  async uploadFile(
    file: Express.Multer.File,
    subfolder: string,
    accountId?: string,
    fileType?: string,
  ): Promise<{ primarykey: string; url: string; key: string }> {
    const result = await this.uploadAndSaveFile(
      file,
      subfolder,
      accountId,
      fileType,
    );

    if (accountId && subfolder === 'avatars') {
      await this.updateUserAvatar(accountId, result.s3Key);
    }

    return {
      primarykey: result.primarykey,
      url: result.url,
      key: result.s3Key,
    };
  }

  async deleteFileWithDbRecord(key: string) {
    const fileRecord = await this.prisma.file.findFirst({
      where: { path: key },
      include: {
        TaskAttachment: true,
        CommentAttachment: true,
        ChatAttachment: true,
      },
    });

    if (fileRecord) {
      await this.prisma.$transaction([
        ...fileRecord.TaskAttachment.map(a => 
          this.prisma.taskAttachment.delete({ where: { primarykey: a.primarykey } })
        ),
        ...fileRecord.CommentAttachment.map(a => 
          this.prisma.commentAttachment.delete({ where: { primarykey: a.primarykey } })
        ),
        ...fileRecord.ChatAttachment.map((a) =>
          this.prisma.chatAttachment.delete({
            where: { primarykey: a.primarykey },
          }),
        ),
        this.prisma.file.delete({
          where: { primarykey: fileRecord.primarykey },
        }),
      ]);
    }

    await this.deleteFile(key);
  }

  async getUserFiles(userId: string) {
    const files = await this.prisma.file.findMany({
      where: { uploadedById: userId, isDeleted: false },
      orderBy: { uploadedAt: 'desc' },
    });

    return Promise.all(
      files.map(async (file) => ({
        ...file,
        rl: await this.generatePresignedUrl(file.path),
      })),
    );
  }

  async updateUserAvatar(userId: string, key: string) {
    const url = await this.generatePresignedUrl(key);

    await this.prisma.account.update({
      where: { primarykey: userId },
      data: { avatarUrl: url },
    });

    return url;
  }

  async getFileStream(key: string): Promise<Readable | undefined> {
    try {
      const response = await this.s3.send(
        new GetObjectCommand({ Bucket: this.bucketName, Key: key })
      );
      return response.Body as Readable;
    } catch (error) {
      return undefined;
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({ Bucket: this.bucketName, Key: key }),
      );
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      await this.s3.send(
        new HeadObjectCommand({ Bucket: this.bucketName, Key: key }),
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  async getFileUrl(key: string, expiresIn = 3600): Promise<string> {
    return this.generatePresignedUrl(key, expiresIn);
  }
}
