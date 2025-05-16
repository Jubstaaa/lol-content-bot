import path from "path";
import { fileURLToPath } from "url";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export const TEMP_DIR = path.join(__dirname, "../temp");
export const OUTPUT_DIR = path.join(__dirname, "../output");
export const BASE_URL = `https://ddragon.leagueoflegends.com/cdn`;

export const ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN || "";
export const PAGE_ID = process.env.IG_PAGE_ID || "";
export const IG_USER_ID = process.env.IG_USER_ID || "";
export const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
export const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL; 