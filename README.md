# League of Legends Daily Lore Video Bot

This Node.js project automatically generates and uploads a daily League of Legends champion lore video, complete with audio narration, splash art images, and animated subtitles. The video is posted to Instagram Reels and hosted via Discord CDN, all orchestrated by GitHub Actions.

## Features

- **Random Champion**: Selects a random champion daily from Riot's Data Dragon API.
- **Latest Data**: Fetches the latest Data Dragon version and champion lore.
- **Audio Narration**: Uses ElevenLabs API for high-quality TTS narration, with word-level timestamps for subtitle alignment.
- **Splash Art Slideshow**: Downloads all splash arts for the champion and creates a vertical (1080x1920) video.
- **Animated Subtitles**: Generates stylized, top-aligned, yellow ASS subtitles with black outline and fade-in/out animation.
- **Video Optimization**: Outputs a 720x1280, 24fps, size-optimized video for Instagram/Discord.
- **Automated Upload**: Uploads the video to Discord via webhook (for public CDN hosting) and posts to Instagram Reels via the Graph API.
- **Fully Automated**: Runs daily via GitHub Actions, with all secrets managed via GitHub Secrets.

## Prerequisites

- Node.js (v14 or higher)
- ffmpeg installed on your system
- ElevenLabs API key
- Discord webhook URL
- Instagram Graph API credentials (Access Token, User ID)

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your secrets:
   ```
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   DISCORD_WEBHOOK_URL=your_discord_webhook_url
   IG_ACCESS_TOKEN=your_instagram_access_token
   IG_USER_ID=your_instagram_user_id
   ```

## Usage (Manual)

1. Make sure ffmpeg is installed
2. Run the script:
   ```bash
   npm start
   ```
3. The final video will be saved as `output/final_video.mp4` and uploaded to Discord/Instagram automatically.

## Automation (GitHub Actions)

- The workflow in `.github/workflows/daily.yml` runs the script daily, handles all secrets, and uploads the video.
- Video is hosted on Discord CDN for public access and posted to Instagram Reels.

## Output

- Video: `output/final_video.mp4` (vertical, optimized for Reels)
- Temporary files: stored in `temp/` and auto-cleaned

## Notes

- All unused files and legacy code have been removed for clarity and maintainability.
- For troubleshooting, check GitHub Actions logs and Discord/Instagram API responses.
