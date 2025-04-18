import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectVersionsCommand } from "@aws-sdk/client-s3";
import s3Client from "../config/s3Client";
import prisma from '../prisma';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

class S3Service {
  private generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const sanitizedFileName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_"); // Заменяем спецсимволы на "_"
    return `${timestamp}-${randomString}-${sanitizedFileName}`;
  }

  async generateNewSignedUrl(fileKey: string) {
    const getObjectParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: fileKey,
    };
  
    const getObjectCommand = new GetObjectCommand(getObjectParams);
    const fileUrl = await getSignedUrl(s3Client, getObjectCommand, { expiresIn: 604800 });
  
    return fileUrl;
  }

  private extractFileNameFromUrl(url: string): string {
    const parts = url.split('/');
    const fileNameWithParams = parts[parts.length - 1];
    const fileName = fileNameWithParams.split('?')[0]; // Убираем параметры подписанного URL
    return fileName;
  }

  async uploadFile(file: Express.Multer.File, accountId: string, folder: string) {
    const uniqueFileName = this.generateUniqueFileName(file.originalname);
    const fileKey = `${folder}/${uniqueFileName}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      // Получаем текущий аватар пользователя
      if (accountId !== "system") {
        const user = await prisma.account.findUnique({
          where: { primarykey: accountId },
          select: { avatarUrl: true },
        });
  
        if (user?.avatarUrl) {
          const oldFileName = this.extractFileNameFromUrl(user.avatarUrl);
          await this.deleteFile(oldFileName, folder);
        }
      }

      const command = new PutObjectCommand(params);
      const response = await s3Client.send(command);
      console.log("File uploaded successfully:", response);

      // Генерируем подписанный URL
      const getObjectParams = {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: fileKey,
      };
      const getObjectCommand = new GetObjectCommand(getObjectParams);
      const fileUrl = await getSignedUrl(s3Client, getObjectCommand, { expiresIn: 604800 });

      console.log("Generated Presigned URL:", fileUrl);
      return fileUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }

  async getFile(fileName: string, folder: string = "maps/avatars") {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: `${folder}/${fileName}`,
    };

    try {
      const command = new GetObjectCommand(params);
      const response = await s3Client.send(command);
      return response.Body; // Возвращает поток данных (ReadableStream)
    } catch (error) {
      console.error("Error getting file:", error);
      return undefined;
    }
  }

  async deleteFile(fileName: string, folder: string = "maps/avatars") {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: `${folder}/${fileName}`,
    };

    console.log("Deleting file with key:", params.Key);

    try {
      // Удаляем основную версию файла
      const deleteCommand = new DeleteObjectCommand(params);
      await s3Client.send(deleteCommand);
  
      // Удаляем все версии файла (если включена версионность)
      const listVersionsCommand = new ListObjectVersionsCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Prefix: `${folder}/${fileName}`,
      });
  
      const versions = await s3Client.send(listVersionsCommand);
      if (versions.Versions) {
        for (const version of versions.Versions) {
          const deleteVersionCommand = new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: version.Key!,
            VersionId: version.VersionId,
          });
          await s3Client.send(deleteVersionCommand);
        }
      }
  
      console.log("File and all versions deleted successfully");
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }

  async updateUserAvatar(accountId: string, avatarUrl: string) {
    try {
      const updatedAccount = await prisma.account.update({
        where: { primarykey: accountId },
        data: { avatarUrl },
      });

      return updatedAccount;
    } catch (error) {
      console.error("Error updating user avatar:", error);
      throw error;
    }
  }
}

export default new S3Service();