import { Client } from "instagram-graph-api";

export async function postVideoToInstagram(
  videoUrl,
  caption,
  accessToken,
  pageId
) {
  const client = new Client(accessToken, pageId);
  const reelRequest = client
    .newPostPageReelMediaRequest()
    .withVideoUrl(videoUrl)
    .withCaption(caption);
  const reelResponse = await reelRequest.execute();
  const containerId = reelResponse.getId();
  const publishRequest = client
    .newPostPublishMediaRequest()
    .withCreationId(containerId);
  const publishResponse = await publishRequest.execute();
  return publishResponse.getId();
}
