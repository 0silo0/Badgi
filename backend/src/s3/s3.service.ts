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
    // Убедимся, что все обязательные переменные окружения существуют
    const endpoint = this.getRequiredConfig('AWS_ENDPOINT');
    const region = this.getRequiredConfig('AWS_REGION');
    const accessKeyId = this.getRequiredConfig('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.getRequiredConfig('AWS_SECRET_ACCESS_KEY');
    this.bucketName = this.getRequiredConfig('AWS_BUCKET_NAME');

    this.s3 = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true, // важно для Cloud.ru
    });
  }

  private getRequiredConfig(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`Missing required config: ${key}`);
    }
    return value;
  }
  private generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${randomString}-${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  }

  async generatePresignedUrl(key: string, expiresIn = 604800): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    return getSignedUrl(this.s3, command, { expiresIn });
  }

  async uploadAndSaveFile(
    file: Express.Multer.File,
    folder: string,
    userId?: string,
    fileType?: string,
  ) {
    // Загружаем файл в S3
    const { url, key } = await this.uploadFile(file, folder, userId, fileType);

    // Сохраняем информацию в базу данных
    const dbFile = await this.prisma.file.create({
      data: {
        value: url, // Сохраняем подписанный URL
        type: fileType || file.mimetype,
        userId: userId, // Привязываем к пользователю
      },
    });

    return {
      ...dbFile,
      s3Key: key, // Возвращаем также ключ S3 для управления файлом
    };
  }

  async uploadFile(
    file: Express.Multer.File,
    subfolder: string,
    accountId?: string,
    _fileType?: string,
  ): Promise<{ url: string; key: string }> {
    console.log(`Uploading file to badgi/${subfolder}`);
    const uniqueFileName = this.generateUniqueFileName(file.originalname);
    const key = `badgi/${subfolder}/${uniqueFileName}`;

    const uploadCommand = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3.send(uploadCommand);

    if (accountId && subfolder === 'avatars') {
      await this.updateUserAvatar(accountId, key);
    }

    const url = await this.generatePresignedUrl(key);
    console.log(`File uploaded: ${key}`);
    return { url, key };
  }

  async getFileStream(key: string): Promise<Readable | undefined> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      const response = await this.s3.send(command);
      return response.Body as Readable;
    } catch (error) {
      return undefined;
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      // Удаление основной версии
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );

      // Удаление всех версий (если включено)
      const versions = await this.s3.send(
        new ListObjectVersionsCommand({
          Bucket: this.bucketName,
          Prefix: key,
        }),
      );

      if (versions.Versions) {
        await Promise.all(
          versions.Versions.map((v) =>
            this.s3.send(
              new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: v.Key!,
                VersionId: v.VersionId,
              }),
            ),
          ),
        );
      }
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      await this.s3.send(
        new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
      return true;
    } catch (error) {
      if (error.name === 'NotFound') return false;
      throw error;
    }
  }

  async getUserFiles(userId: string) {
    return this.prisma.file.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async updateUserAvatar(userId: string, fileKey: string) {
    const url = await this.generatePresignedUrl(fileKey);

    await this.prisma.account.update({
      where: { primarykey: userId },
      data: { avatarUrl: url },
    });
  }

  async getFileUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3, command, { expiresIn });
  }

  async deleteFileWithDbRecord(key: string) {
    // Находим запись в БД по URL файла
    const fileRecord = await this.prisma.file.findFirst({
      where: { value: { contains: key } },
    });

    // Удаляем из S3
    await this.deleteFile(key);

    // Если есть запись в БД - удаляем и её
    if (fileRecord) {
      await this.prisma.file.delete({
        where: { primarykey: fileRecord.primarykey },
      });
    }
  }
}
