import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

export async function uploadToCloudinary(filePath) {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error(
      "Cloudinary credentials are not set in environment variables"
    );
  }

  // Configure Cloudinary
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  try {
    // Upload the video file
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "video",
      folder: "lol-content-bot",
      public_id: `video_${Date.now()}`,
      overwrite: true,
      invalidate: true,
    });

    if (uploadResult && uploadResult.secure_url) {
      return uploadResult.secure_url;
    } else {
      throw new Error("Upload failed: No secure URL received");
    }
  } catch (error) {
    console.error("Cloudinary upload error:", error.message);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
}

// Keep the old function name for backward compatibility
export async function uploadToCatbox(filePath) {
  return uploadToCloudinary(filePath);
}
