import axios from "axios";

let DATA_DRAGON_VERSION = null;
const BASE_URL = `https://ddragon.leagueoflegends.com/cdn`;

export async function fetchLatestDataDragonVersion() {
  const response = await axios.get(
    "https://ddragon.leagueoflegends.com/api/versions.json"
  );
  return response.data[0];
}

export async function fetchChampionData(CHAMPION_NAME) {
  if (!DATA_DRAGON_VERSION) {
    DATA_DRAGON_VERSION = await fetchLatestDataDragonVersion();
  }
  const response = await axios.get(
    `${BASE_URL}/${DATA_DRAGON_VERSION}/data/en_US/champion/${CHAMPION_NAME}.json`
  );
  return response.data.data[CHAMPION_NAME];
}
