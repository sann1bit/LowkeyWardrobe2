import { Router, type IRouter, type Request, type Response } from "express";
import { getUploadSignedUrl } from "../lib/supabaseStorage";

const router: IRouter = Router();

/**
 * POST /storage/uploads/request-url
 * Returns a Supabase signed upload URL + the final public URL.
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
