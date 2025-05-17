import "dotenv/config";
import champions from "../champions.json" assert { type: "json" };
import { fetchChampionData } from "./api/riot.js";
import { generateAudio } from "./api/elevenlabs.js";
import { uploadVideoToDiscord } from "./api/discord.js";
import { postVideoToInstagram } from "./api/instagram.js";
import { downloadSplashArt, cleanup } from "./utils/file.js";
import { getAudioDuration, createVideo } from "./utils/video.js";
import {
  TEMP_DIR,
  OUTPUT_DIR,
  BASE_URL,
  ACCESS_TOKEN,
  PAGE_ID,
  ELEVENLABS_API_KEY,
  DISCORD_WEBHOOK_URL,
} from "./config.js";
import fs from "fs-extra";

fs.ensureDirSync(TEMP_DIR);
fs.ensureDirSync(OUTPUT_DIR);

function getRandomChampion() {
  const idx = Math.floor(Math.random() * champions.length);
  return champions[idx].id;
}

async function main() {
  try {
    const CHAMPION_NAME = getRandomChampion();
    const championData = await fetchChampionData(CHAMPION_NAME);
    const { audioPath, assPath } = await generateAudio(
      championData.lore,
      ELEVENLABS_API_KEY
    );
    const audioDuration = await getAudioDuration(audioPath);
    const imagePaths = [];
    const downloadPromises = championData.skins.map(async (skin) => {
      const imagePath = await downloadSplashArt(
        skin.num,
        CHAMPION_NAME,
        TEMP_DIR,
        BASE_URL
      );
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
      assPath,
      OUTPUT_DIR
    );
    const videoUrl = await uploadVideoToDiscord(videoPath, DISCORD_WEBHOOK_URL);
    const caption =
      `🛡️ ${championData.name} Lore!\n\n` +
      championData.lore +
      "\n\n" +
      "Which champion's lore should we cover next? Let us know in the comments! 💬\n" +
      "#leagueoflegends #lol #lore #champion #explore #fyp #reels #gaming #riotgames #videomaking #esports #legendary #viral #explorepage #gamers #videocontent #storytime";
    await postVideoToInstagram(videoUrl, caption, ACCESS_TOKEN, PAGE_ID);
    await cleanup(TEMP_DIR);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

main();
