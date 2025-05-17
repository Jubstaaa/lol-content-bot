import { writeFile } from "fs/promises";

function assTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.floor((seconds - Math.floor(seconds)) * 100);
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(
    2,
    "0"
  )}.${String(cs).padStart(2, "0")}`;
}

export async function generateASSFromAlignment(alignment, outputPath) {
  if (
    !alignment ||
    !alignment.characters ||
    !alignment.character_start_times_seconds ||
    !alignment.character_end_times_seconds
  ) {
    throw new Error("Invalid alignment data");
  }
  const style = `Style: Default,Arial,120,&H0000FFFF,&H00000000,&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,5,0,2,10,10,300,1`;
  let ass = `[Script Info]\nScriptType: v4.00+\nPlayResX: 1080\nPlayResY: 1920\n\n[V4+ Styles]\nFormat: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding\n${style}\n\n[Events]\nFormat: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text\n`;
  let word = "";
  let wordStartIdx = null;
  let wordEndIdx = null;
  for (let i = 0, index = 1; i < alignment.characters.length; i++) {
    const char = alignment.characters[i];
    if (char !== " ") {
      if (word === "") wordStartIdx = i;
      word += char;
      wordEndIdx = i;
    }
    const isLastChar = i === alignment.characters.length - 1;
    const nextCharIsSpace = !isLastChar && alignment.characters[i + 1] === " ";
    if (char !== " " && (nextCharIsSpace || isLastChar) && word.length > 0) {
      const start = alignment.character_start_times_seconds[wordStartIdx];
      const end = alignment.character_end_times_seconds[wordEndIdx];
      const fade = "{\\fad(300,300)}";
      ass += `Dialogue: 0,${assTime(start)},${assTime(
        end
      )},Default,,0,0,0,,${fade}${word}\n`;
      index++;
      word = "";
      wordStartIdx = null;
      wordEndIdx = null;
    }
  }
  await writeFile(outputPath, ass, "utf8");
  return outputPath;
}
