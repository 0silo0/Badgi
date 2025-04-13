import { Request, Response } from "express";
import S3Service from "../services/s3Service";
import { Readable } from "stream";

class FileController {
  async uploadFile(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).send("No file uploaded.");
      }

      const { status, id, path } = req.body;

      let accountId;

      if (status === 'forUserAdmin') {
        // Если статус 'forUserAdmin', используем userId из тела запроса
        if (!id) {
          return res.status(400).json({ message: "User ID is required for 'forUserAdmin' status." });
        }
        accountId = id;
      } else {
        // Иначе используем accountId из аутентифицированного пользователя
        accountId = req.user?.primarykey;
        if (!accountId) {
          return res.status(401).json({ message: "User not authenticated" });
        }
      }

      const fileUrl = await S3Service.uploadFile(req.file, accountId, `badgi/${path}`);
      if (path === "avatars") {
        const updatedAccount = await S3Service.updateUserAvatar(accountId, fileUrl);
        res.status(200).json({ message: 'Файл аватарки успешно обновлен в профиле!', fileUrl, updatedAccount });
      } else {
        res.status(200).json({ message: "File uploaded successfully!", fileUrl });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).send("Error uploading file.");
    }
  }

  async getFile(req: Request, res: Response) {
    try {
      const { fileName } = req.params;
      const fileStream = await S3Service.getFile(fileName, "avatars");

      if (!fileStream) {
        return res.status(404).send("File not found.");
      }

      const readableStream = fileStream as Readable;

      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
      res.setHeader("Content-Type", "application/octet-stream");

      readableStream.pipe(res);
    } catch (error) {
      console.log('Error getting file - ', error);
      res.status(500).send("Error getting file.");
    }
  }

  async deleteFile(req: Request, res: Response) {
    try {
      const { fileName } = req.params;
      await S3Service.deleteFile(fileName, "avatars");
      res.status(200).send("File deleted successfully!");
    } catch (error) {
      console.log("Error deleting file - ", error)
      res.status(500).send("Error deleting file.");
    }
  }
}

export default new FileController();