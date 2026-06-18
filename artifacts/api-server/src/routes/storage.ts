import { Router, type IRouter, type Request, type Response } from "express";
import { randomUUID } from "crypto";
import {
  uploadObject,
  getObjectPublicUrl,
} from "../lib/supabaseStorage";

const router: IRouter = Router();

/**
 * POST /storage/uploads/file
 * Accepts JSON { data: "<base64>", type: "image/jpeg" }
 * Uploads directly to Supabase via service role (no CORS issues).
 */
router.post(
  "/storage/uploads/file",
  async (req: Request, res: Response) => {
    const { data: base64, type: contentType } = (req.body ?? {}) as { data?: string; type?: string };

    if (typeof base64 !== "string" || typeof contentType !== "string" || !base64 || !contentType) {
      res.status(400).json({ error: "Missing required fields: data (base64 string), type (MIME type)" });
      return;
    }

    const buffer = Buffer.from(base64, "base64");
    if (buffer.length === 0) {
      res.status(400).json({ error: "Empty file data" });
      return;
    }

    const ext = contentType.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
    const objectName = `uploads/${randomUUID()}.${ext}`;

    try {
      await uploadObject(objectName, buffer, contentType);
      res.json({ publicUrl: getObjectPublicUrl(objectName), objectName });
    } catch (error) {
      const cause = error instanceof Error ? (error.cause as Error | undefined) : undefined;
      req.log.error({
        err: error,
        errMessage: error instanceof Error ? error.message : String(error),
        errCause: cause?.message ?? String(cause),
        supabaseUrl: process.env.SUPABASE_URL,
        hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      }, "Supabase upload failed");
      const message = error instanceof Error ? error.message : "Upload failed";
      res.status(500).json({ error: `Upload failed: ${message}`, cause: cause?.message });
    }
  },
);

export default router;
