import { Router } from "express";
import S3Controller from "../controllers/s3Controller";
import { authenticate } from "../middleware/authMiddleware";
import multer from "multer";

const router = Router();
const upload = multer();

router.post("/upload", authenticate, upload.single("file"), S3Controller.uploadFile);
router.get("/file/:fileName", authenticate, S3Controller.getFile);
router.delete("/file/:fileName", authenticate, S3Controller.deleteFile);

export default router;