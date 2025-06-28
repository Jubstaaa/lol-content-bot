import axios from "axios";
import fs from "fs";
import FormData from "form-data";

const GOFILE_API_KEY = process.env.GOFILE_API_KEY;

export async function uploadToGoFile(filePath) {
  if (!GOFILE_API_KEY) {
    throw new Error("GOFILE_API_KEY is not set in environment variables");
  }

  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));
  form.append("token", GOFILE_API_KEY);

  const uploadRes = await axios.post(
    "https://upload.gofile.io/uploadfile",
    form,
    {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    }
  );

  if (
    uploadRes.data.status === "ok" &&
    uploadRes.data.data &&
    uploadRes.data.data.downloadPage
  ) {
    return uploadRes.data.data.downloadPage;
  } else {
    throw new Error(
      "GoFile upload failed: " +
        (uploadRes.data.status || JSON.stringify(uploadRes.data))
    );
  }
}

export async function uploadToCatbox(filePath) {
  return uploadToGoFile(filePath);
}
