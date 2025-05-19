import "dotenv/config";
import { fetchChampionData, fetchAllChampions } from "./api/riot.js";
import { generateAudio } from "./api/elevenlabs.js";
import { postVideoToInstagram } from "./api/instagram.js";
import { downloadSplashArt, cleanup } from "./utils/file.js";
import { getAudioDuration, createVideo } from "./utils/video.js";
import { uploadToCatbox } from "./utils/catbox.js";
import {
  TEMP_DIR,
  OUTPUT_DIR,
  BASE_URL,
  ACCESS_TOKEN,
  IG_USER_ID,
  ELEVENLABS_API_KEY,
} from "./config.js";
import fs from "fs-extra";

fs.ensureDirSync(TEMP_DIR);
fs.ensureDirSync(OUTPUT_DIR);

async function getRandomChampionId() {
  const champions = await fetchAllChampions();
  const idx = Math.floor(Math.random() * champions.length);
  return champions[idx].id;
}

const FAN_NOTE =
  "⚠️ *Unofficial fan page.* All visuals © Riot Games. Used under Riot Fan Content Policy.\n" +
  "🎙️ Made with AI voice. #AIGenerated";

function buildCaption(championData) {
  const dateTag = dayjs().format("YYYY-MM-DD");         
  return (
    `🛡️ ${championData.name} Lore – ${dateTag}\n\n` +
    championData.lore +
    "\n\n" +
    "Which champion's lore should we cover next? Let us know in the comments! 💬\n\n" +
    FAN_NOTE +
    "\n\n" +
    "#leagueoflegends #lore #fanpage #riotgames"
  );
}


async function main() {
  try {
    const CHAMPION_NAME = await getRandomChampionId();
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
    // Remove nulls (failed downloads)
    const validImagePaths = imagePaths.filter(Boolean);
    if (validImagePaths.length === 0) {
      throw new Error("No splash arts were downloaded successfully");
    }
    const videoPath = await createVideo(
      audioPath,
      validImagePaths,
      audioDuration,
      assPath,
      OUTPUT_DIR
    );
    const videoUrl = await uploadToCatbox(videoPath);
    const caption = buildCaption(championData);
    await postVideoToInstagram(videoUrl, caption, ACCESS_TOKEN, IG_USER_ID);
    await cleanup(TEMP_DIR);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

main();
