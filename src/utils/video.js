import path from "path";
import ffmpeg from "fluent-ffmpeg";

export async function getAudioDuration(audioPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(audioPath, (err, metadata) => {
      if (err) reject(err);
      resolve(metadata.format.duration);
    });
  });
}

export async function createVideo(
  audioPath,
  imagePaths,
  audioDuration,
  assPath,
  outputDir
) {
  const outputPath = path.join(outputDir, "final_video.mp4");
  const fps = 30;
  const imageDuration = audioDuration / imagePaths.length;
  const reelsWidth = 1080;
  const reelsHeight = 1920;
  const command = ffmpeg();
  imagePaths.forEach((img) => {
    command.input(img);
  });
  command.input(audioPath);
  const framesPerImage = Math.floor(imageDuration * fps);
  const filters = imagePaths
    .map((_, i) => {
      return `[${i}:v]format=yuv420p,zoompan=z='zoom+0.001':d=${framesPerImage}:s=${reelsWidth}x${reelsHeight}[v${i}]`;
    })
    .join(";");
  const concatInputs = imagePaths.map((_, i) => `[v${i}]`).join("");
  const filterComplex = `${filters};${concatInputs}concat=n=${
    imagePaths.length
  }:v=1:a=0[out];[out]subtitles=${assPath.replace(/:/g, ":")}:si=0[v]`;
  return new Promise((resolve, reject) => {
    command
      .complexFilter(filterComplex)
      .outputOptions([
        "-map",
        "[v]",
        "-map",
        `${imagePaths.length}:a`,
        "-c:v",
        "libx264",
        "-preset",
        "slow",
        "-crf",
        "23",
        "-t",
        audioDuration.toString(),
        "-r",
        "30",
        "-pix_fmt",
        "yuv420p",
        "-shortest",
      ])
      .output(outputPath)
      .on("end", () => {
        resolve(outputPath);
      })
      .on("error", (err) => {
        reject(err);
      })
      .run();
  });
}
