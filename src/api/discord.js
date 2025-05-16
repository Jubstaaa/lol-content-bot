import FormData from "form-data";
import fs from "fs-extra";
import fetch from "node-fetch";

export async function uploadVideoToDiscord(videoPath, webhookUrl) {
  const form = new FormData();
  form.append(
    "payload_json",
    JSON.stringify({ content: "Daily LoL Lore Video" })
  );
  form.append("file", fs.createReadStream(videoPath));

  const response = await fetch(webhookUrl, {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
  });

  if (!response.ok) throw new Error("Discord upload failed");
  const data = await response.json();
  return data.attachments[0].url;
}
