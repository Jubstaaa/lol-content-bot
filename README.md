# League of Legends Champion Content Generator

This Node.js project creates a video featuring a champion's lore narration with their splash arts as a slideshow. It uses ElevenLabs for text-to-speech and ffmpeg for video creation.

## Prerequisites

- Node.js (v14 or higher)
- ffmpeg installed on your system
- ElevenLabs API key

## Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory and add your ElevenLabs API key:

```
ELEVENLABS_API_KEY=your_api_key_here
```

## Usage

1. Make sure ffmpeg is installed on your system
2. Run the script:

```bash
npm start
```

The script will:

1. Fetch Viego's data from Data Dragon
2. Generate audio narration of Viego's lore using ElevenLabs
3. Download all of Viego's splash arts
4. Create a video with fade transitions between splash arts
5. Save the final video in the `output` directory
6. Clean up temporary files

## Output

The final video will be saved as `output/Viego_video.mp4`. The video will feature:

- Rachel's voice from ElevenLabs narrating Viego's lore
- All of Viego's splash arts with fade transitions
- The duration of each splash art is calculated based on the audio length

## Temporary Files

Temporary files (downloaded splash arts and audio) are stored in the `temp` directory and are automatically cleaned up after the video is created.
