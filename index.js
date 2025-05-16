import "dotenv/config";
import axios from "axios";
import fs from "fs-extra";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import { ElevenLabsClient } from "elevenlabs";
import {
  Client,
  PostPageReelMediaRequest,
  PostPublishMediaRequest,
} from "instagram-graph-api";
import { fileURLToPath } from "url";
import { writeFile } from "fs/promises";
import champions from "./champions.json" assert { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

const TEMP_DIR = path.join(__dirname, "temp");
const OUTPUT_DIR = path.join(__dirname, "output");

fs.ensureDirSync(TEMP_DIR);
fs.ensureDirSync(OUTPUT_DIR);

// Instagram API için gerekli bilgileri buraya gir
const ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN || ""; // .env'den veya buradan
const PAGE_ID = process.env.IG_PAGE_ID || "";
const IG_USER_ID = process.env.IG_USER_ID || "";

let DATA_DRAGON_VERSION = null;
const BASE_URL = `https://ddragon.leagueoflegends.com/cdn`;

async function fetchLatestDataDragonVersion() {
  const response = await axios.get(
    "https://ddragon.leagueoflegends.com/api/versions.json"
  );
  return response.data[0];
}

function getRandomChampion() {
  const idx = Math.floor(Math.random() * champions.length);
  return champions[idx].id;
}

async function fetchChampionData(CHAMPION_NAME) {
  if (!DATA_DRAGON_VERSION) {
    DATA_DRAGON_VERSION = await fetchLatestDataDragonVersion();
  }
  const response = await axios.get(
    `${BASE_URL}/${DATA_DRAGON_VERSION}/data/en_US/champion/${CHAMPION_NAME}.json`
  );
  return response.data.data[CHAMPION_NAME];
}

async function downloadSplashArt(skinNum, CHAMPION_NAME) {
  const url = `${BASE_URL}/img/champion/loading/${CHAMPION_NAME}_${skinNum}.jpg`;
  const outputPath = path.join(TEMP_DIR, `${CHAMPION_NAME}_${skinNum}.jpg`);
  const response = await axios({
    method: "GET",
    url: url,
    responseType: "arraybuffer",
  });
  await fs.writeFile(outputPath, response.data);
  return outputPath;
}

async function generateAudio(text) {
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
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
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

function assTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.floor((seconds - Math.floor(seconds)) * 100);
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(
    2,
    "0"
  )}.${String(cs).padStart(2, "0")}`;
}

async function generateASSFromAlignment(alignment, outputPath) {
  if (
    !alignment ||
    !alignment.characters ||
    !alignment.character_start_times_seconds ||
    !alignment.character_end_times_seconds
  ) {
    throw new Error("Invalid alignment data");
  }
  const style = `Style: Default,Arial,120,&H00FFFF00,&H000000FF,&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,5,0,2,10,10,300,1`;
  let ass = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding
${style}

[Events]
Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text
`;
  let word = "";
  let wordStartIdx = null;
  let wordEndIdx = null;
  for (let i = 0, index = 1; i < alignment.characters.length; i++) {
    const char = alignment.characters[i];
    if (char !== " ") {
      if (word === "") wordStartIdx = i;
      word += char;
      wordEndIdx = i;
    }
    const isLastChar = i === alignment.characters.length - 1;
    const nextCharIsSpace = !isLastChar && alignment.characters[i + 1] === " ";
    if (char !== " " && (nextCharIsSpace || isLastChar) && word.length > 0) {
      const start = alignment.character_start_times_seconds[wordStartIdx];
      const end = alignment.character_end_times_seconds[wordEndIdx];
      const fade = "{\fad(300,300)}";
      ass += `Dialogue: 0,${assTime(start)},${assTime(
        end
      )},Default,,0,0,0,,${fade}${word}\n`;
      index++;
      word = "";
      wordStartIdx = null;
      wordEndIdx = null;
    }
  }
  await writeFile(outputPath, ass, "utf8");
  return outputPath;
}

async function getAudioDuration(audioPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(audioPath, (err, metadata) => {
      if (err) reject(err);
      resolve(metadata.format.duration);
    });
  });
}

async function cleanup() {
  try {
    await fs.emptyDir(TEMP_DIR);
  } catch (error) {}
}

function formatSRTTime(seconds) {
  const totalMilliseconds = Math.floor(seconds * 1000);
  const hours = Math.floor(totalMilliseconds / 3600000);
  const minutes = Math.floor((totalMilliseconds % 3600000) / 60000);
  const secs = Math.floor((totalMilliseconds % 60000) / 1000);
  const millis = totalMilliseconds % 1000;
  return (
    String(hours).padStart(2, "0") +
    ":" +
    String(minutes).padStart(2, "0") +
    ":" +
    String(secs).padStart(2, "0") +
    "," +
    String(millis).padStart(3, "0")
  );
}

async function createVideo(audioPath, imagePaths, audioDuration, assPath) {
  const outputPath = path.join(OUTPUT_DIR, "final_video.mp4");
  const fps = 30;
  const imageDuration = audioDuration / imagePaths.length;
  const reelsWidth = 1080;
  const reelsHeight = 1920;
  const command = ffmpeg();
  imagePaths.forEach((img) => {
    command.input(img);
  });
  command.input(audioPath);
  const framesPerImage = Math.floor(imageDuration * fps);
  const filters = imagePaths
    .map((_, i) => {
      return `[${i}:v]format=yuv420p,zoompan=z='zoom+0.001':d=${framesPerImage}:s=${reelsWidth}x${reelsHeight}[v${i}]`;
    })
    .join(";");
  const concatInputs = imagePaths.map((_, i) => `[v${i}]`).join("");
  const filterComplex = `${filters};${concatInputs}concat=n=${
    imagePaths.length
  }:v=1:a=0[out];[out]subtitles=${assPath.replace(/:/g, ":")}:si=0[v]`;
  return new Promise((resolve, reject) => {
    command
      .complexFilter(filterComplex)
      .outputOptions([
        "-map",
        "[v]",
        "-map",
        `${imagePaths.length}:a`,
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-t",
        audioDuration.toString(),
        "-r",
        fps.toString(),
        "-pix_fmt",
        "yuv420p",
        "-shortest",
      ])
      .output(outputPath)
      .on("end", () => {
        resolve(outputPath);
      })
      .on("error", (err) => {
        reject(err);
      })
      .run();
  });
}

// Videoyu Instagram'a yükle (public URL gerektirir)
async function postVideoToInstagram(videoUrl, caption) {
  const client = new Client(ACCESS_TOKEN, PAGE_ID);
  // 1. Reels Container oluştur
  const reelRequest = client
    .newPostPageReelMediaRequest()
    .withVideoUrl(videoUrl)
    .withCaption(caption);
  const reelResponse = await reelRequest.execute();
  const containerId = reelResponse.getId();
  // 2. (Opsiyonel) Container'ın işlenmesini bekle (status=FINISHED)
  // 3. Yayınla
  const publishRequest = client
    .newPostPublishMediaRequest()
    .withCreationId(containerId);
  const publishResponse = await publishRequest.execute();
  return publishResponse.getId();
}

async function main() {
  try {
    const CHAMPION_NAME = getRandomChampion();
    const championData = await fetchChampionData(CHAMPION_NAME);
    const { audioPath, assPath } = await generateAudio(championData.lore);
    const audioDuration = await getAudioDuration(audioPath);
    const imagePaths = [];
    const downloadPromises = championData.skins.map(async (skin) => {
      const imagePath = await downloadSplashArt(skin.num, CHAMPION_NAME);
      imagePaths.push(imagePath);
      return imagePath;
    });
    await Promise.all(downloadPromises);
    if (imagePaths.length === 0) {
      throw new Error("No splash arts were downloaded successfully");
    }
    const videoPath = await createVideo(
      audioPath,
      imagePaths,
      audioDuration,
      assPath
    );
    // Videoyu bir yere upload etmen gerekiyor, örn. S3, kendi sunucun, vs.
    // Burada videoUrl'yi belirlemen lazım:
    const videoUrl =
      process.env.PUBLIC_VIDEO_URL ||
      "https://your-public-url.com/final_video.mp4";
    const caption =
      championData.lore +
      "\n\nWhich champion's lore should be next? Let us know in the comments!";
    // Instagram'a otomatik paylaş
    // await postVideoToInstagram(videoUrl, caption);
    await cleanup();
  } catch (error) {
    process.exit(1);
  }
}

main();
