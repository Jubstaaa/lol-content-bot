import axios from "axios";
import path from "path";
import fs from "fs-extra";
import { writeFile } from "fs/promises";
import { generateASSFromAlignment } from "../utils/subtitle.js";

const TEMP_DIR = path.resolve("temp");

export async function generateAudio(text, apiKey) {
  const voiceId = "NOpBlnGInO9m6vDvFkFC";
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`;
  const interaction =
    "Which champion's lore should be next? Let us know in the comments!";
  const fullText = text.trim() + "\n\n" + interaction;
  const response = await axios.post(
    url,
    {
      text: fullText,
      model_id: "eleven_turbo_v2",
    },
    {
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
    }
  );
  const audioBase64 = response.data.audio_base64;
  const audioBuffer = Buffer.from(audioBase64, "base64");
  const audioPath = path.join(TEMP_DIR, "narration.mp3");
  await fs.writeFile(audioPath, audioBuffer);
  const alignment =
    response.data.normalized_alignment || response.data.alignment;
  const assPath = path.join(TEMP_DIR, "narration.ass");
  await generateASSFromAlignment(alignment, assPath);
  return { audioPath, assPath };
}
