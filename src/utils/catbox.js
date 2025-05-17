import axios from "axios";
import fs from "fs";
import FormData from "form-data";

export async function uploadToCatbox(filePath) {
  const form = new FormData();
  form.append("reqtype", "fileupload");
  form.append("fileToUpload", fs.createReadStream(filePath));
  const response = await axios.post("https://catbox.moe/user/api.php", form, {
    headers: form.getHeaders(),
  });
  return response.data;
}
