import fs from "fs-extra";
import path from "path";
import axios from "axios";

export async function downloadSplashArt(
  skinNum,
  CHAMPION_NAME,
  tempDir,
  baseUrl
) {
  const url = `${baseUrl}/img/champion/loading/${CHAMPION_NAME}_${skinNum}.jpg`;
  const outputPath = path.join(tempDir, `${CHAMPION_NAME}_${skinNum}.jpg`);
  const response = await axios({
    method: "GET",
    url: url,
    responseType: "arraybuffer",
  });
  await fs.writeFile(outputPath, response.data);
  return outputPath;
}

export async function cleanup(tempDir) {
  try {
    await fs.emptyDir(tempDir);
  } catch (error) {}
}
