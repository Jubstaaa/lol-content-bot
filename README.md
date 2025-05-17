# League of Legends Daily Lore Video Bot

This Node.js project automatically generates and uploads a daily League of Legends champion lore video, complete with audio narration, splash art images, and animated subtitles. The video is posted to Instagram Reels and hosted via Catbox.moe, all orchestrated by GitHub Actions.

## Features

- **Random Champion**: Selects a random champion daily from Riot's Data Dragon API.
- **Latest Data**: Fetches the latest Data Dragon version and champion lore.
- **Audio Narration**: Uses ElevenLabs API for high-quality TTS narration, with word-level timestamps for subtitle alignment.
- **Splash Art Slideshow**: Downloads all splash arts for the champion and creates a vertical (1080x1920) video.
- **Animated Subtitles**: Generates stylized, top-aligned, yellow ASS subtitles with black outline and fade-in/out animation.
- **Video Optimization**: Outputs a 720x1280, 24fps, size-optimized video for Instagram/Catbox.moe.
- **Automated Upload**: Uploads the video to Catbox.moe (for public hosting) and posts to Instagram Reels via the Graph API.
- **Fully Automated**: Runs daily via GitHub Actions, with all secrets managed via GitHub Secrets.

## Prerequisites

- Node.js (v14 or higher)
- ffmpeg installed on your system
- ElevenLabs API key
- Instagram Graph API credentials (Long-Lived Access Token, User ID)

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your secrets:
   ```
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   IG_ACCESS_TOKEN=your_long_lived_instagram_access_token
   IG_USER_ID=your_instagram_user_id
   ```

## Usage (Manual)

1. Make sure ffmpeg is installed
2. Run the script:
   ```bash
   npm start
   ```
3. The final video will be saved as `output/final_video.mp4` and uploaded to Catbox.moe/Instagram automatically.

## Automation (GitHub Actions)

- The workflow in `.github/workflows/daily.yml` runs the script daily, handles all secrets, and uploads the video.
- Video is hosted on Catbox.moe for public access and posted to Instagram Reels.

## Output

- Video: `output/final_video.mp4` (vertical, optimized for Reels)
- Temporary files: stored in `temp/` and auto-cleaned

## Instagram Long-Lived Access Token: Creation & Renewal

### 1. Create a Short-Lived Access Token

- Go to [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- Select your app and user, and add these permissions: `pages_show_list`, `business_management`, `instagram_basic`, `instagram_content_publish`
- Click "Generate Access Token" and copy the token

### 2. Exchange for a Long-Lived Token

Use the following cURL command (replace values with your own):

```bash
curl -X GET "https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_SHORT_LIVED_TOKEN"
```

- `YOUR_APP_ID`: Your Facebook App ID
- `YOUR_APP_SECRET`: Your Facebook App Secret
- `YOUR_SHORT_LIVED_TOKEN`: The token you copied from the Explorer

The response will include a new `access_token` valid for about 60 days. Use this as `IG_ACCESS_TOKEN` in your `.env` and GitHub Secrets.

### 3. Refresh the Long-Lived Token

Before the token expires, refresh it with:

```bash
curl -X GET "https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=YOUR_LONG_LIVED_TOKEN"
```

- Replace `YOUR_LONG_LIVED_TOKEN` with your current token
- The response will include a new token and expiration

**Note:** If you ever get an "invalid_token" or "expired" error, repeat the steps above to generate a new token.

## Notes

- All unused files and legacy code have been removed for clarity and maintainability.
- For troubleshooting, check GitHub Actions logs and Instagram/Catbox.moe API responses.
