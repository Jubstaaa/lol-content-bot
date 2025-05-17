import axios from "axios";

export async function postVideoToInstagram(
  videoUrl,
  caption,
  accessToken,
  userId
) {
  // 1. Create media object (container)
  const createRes = await axios.post(
    `https://graph.facebook.com/v19.0/${userId}/media`,
    {
      video_url: videoUrl,
      caption: caption,
      media_type: "REELS",
      share_to_feed: true,
      access_token: accessToken,
    }
  );
  const creationId = createRes.data.id;
  // 2. Wait for Instagram to process the video (30s)
  await new Promise((res) => setTimeout(res, 30000));
  // 3. Publish the media object
  const publishRes = await axios.post(
    `https://graph.facebook.com/v19.0/${userId}/media_publish`,
    {
      creation_id: creationId,
      access_token: accessToken,
    }
  );
  return publishRes.data;
}
