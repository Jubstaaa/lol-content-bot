import axios from "axios";

export async function postVideoToInstagram(
  videoUrl,
  caption,
  accessToken,
  userId
) {
  const createRes = await axios.post(
    `https://graph.facebook.com/v22.0/${userId}/media`,
    {
      video_url: videoUrl,
      caption: caption,
      media_type: "REELS",
      share_to_feed: true,
      access_token: accessToken,
    }
  );
  const creationId = createRes.data.id;
  let status = "IN_PROGRESS";
  let tries = 0;
  const maxTries = 1000;
  while (status !== "FINISHED" && tries < maxTries) {
    await new Promise((res) => setTimeout(res, 7000));
    const statusRes = await axios.get(
      `https://graph.facebook.com/v22.0/${creationId}?fields=status_code&access_token=${accessToken}`
    );
    status = statusRes.data.status_code;
    console.log(status);
    tries++;
  }
  if (status !== "FINISHED") {
    throw new Error("Media is not ready after waiting.");
  }
  const publishRes = await axios.post(
    `https://graph.facebook.com/v22.0/${userId}/media_publish`,
    {
      creation_id: creationId,
      access_token: accessToken,
    }
  );
  return publishRes.data;
}
