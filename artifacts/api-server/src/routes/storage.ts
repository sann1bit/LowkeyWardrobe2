import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import { randomUUID } from "crypto";
import {
  getUploadSignedUrl,
  uploadObject,
  getObjectPublicUrl,
} from "../lib/supabaseStorage";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

/**
 * POST /storage/uploads/file
 * Accepts multipart/form-data with a single "file" field.
 * Uploads directly to Supabase via service role (no CORS issues).
 */
router.post(
  "/storage/uploads/file",
  upload.single("file"),
  async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }

    const { mimetype, buffer } = req.file;
    const ext = mimetype.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
    const objectName = `uploads/${randomUUID()}.${ext}`;

    try {
      await uploadObject(objectName, buffer, mimetype);
      res.json({ publicUrl: getObjectPublicUrl(objectName), objectName });
    } catch (error) {
      req.log.error({ err: error }, "Supabase upload failed");
      const message = error instanceof Error ? error.message : "Upload failed";
      res.status(500).json({ error: `Upload failed: ${message}` });
    }
  },
);

/**
 * POST /storage/uploads/request-url  (kept for backward compat)
 */
router.post("/storage/uploads/request-url", async (req: Request, res: Response) => {
  const { name, size, contentType } = req.body ?? {};
  if (typeof name !== "string" || typeof size !== "number" || typeof contentType !== "string") {
    res.status(400).json({ error: "Missing or invalid required fields: name, size, contentType" });
    return;
  }

  try {
    const { uploadURL, objectPath, publicUrl } = await getUploadSignedUrl(contentType);
    res.json({ uploadURL, objectPath, publicUrl, metadata: { name, size, contentType } });
  } catch (error) {
    req.log.error({ err: error }, "Error generating upload URL");
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

export default router;
