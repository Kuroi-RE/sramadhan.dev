import fs from "node:fs/promises";
import path from "node:path";
import { parseFile, selectCover } from "music-metadata";

export function formatLabel(filename) {
  const nameWithoutExt =
    filename.substring(0, filename.lastIndexOf(".")) || filename;
  return nameWithoutExt
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

export function parseFallbackTitleAndArtist(basename) {
  if (basename.includes(" - ")) {
    const parts = basename.split(" - ");
    return {
      artist: parts[0].trim(),
      title: parts.slice(1).join(" - ").trim(),
    };
  }
  return {
    artist: "Unknown Artist",
    title: formatLabel(basename),
  };
}

export async function generateManifests(options = {}) {
  const rootDir = options.rootDir || process.cwd();
  const publicDir = options.publicDir || path.join(rootDir, "public");
  const outDir = options.outDir || path.join(rootDir, "src", "generated");

  const wallpaperDir = path.join(publicDir, "wallpaper");
  const musicDir = path.join(publicDir, "music");
  const coversDir = path.join(musicDir, "covers");

  await fs.mkdir(outDir, { recursive: true });

  // 1. Process Wallpapers
  const wallpapers = [];
  try {
    await fs.mkdir(wallpaperDir, { recursive: true });
    const wallpaperFiles = await fs.readdir(wallpaperDir);
    const validImageExts = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

    for (const file of wallpaperFiles) {
      const ext = path.extname(file).toLowerCase();
      if (validImageExts.has(ext)) {
        const id = path.basename(file, ext);
        wallpapers.push({
          id,
          path: `/wallpaper/${file}`,
          label: formatLabel(file),
        });
      }
    }
  } catch (err) {
    console.warn("Notice: could not read wallpaper directory", err.message);
  }

  // Fallback if no wallpaper present
  if (wallpapers.length === 0) {
    wallpapers.push({
      id: "default-gradient",
      path: "",
      label: "Default Dark Mesh",
    });
  }

  // 2. Process Music
  const musicTracks = [];
  try {
    await fs.mkdir(musicDir, { recursive: true });
    const musicFiles = await fs.readdir(musicDir);

    const validAudioExts = new Set([".mp3", ".m4a", ".ogg", ".flac", ".wav"]);
    const lrcFiles = new Set(
      musicFiles
        .filter((f) => f.toLowerCase().endsWith(".lrc"))
        .map((f) => path.basename(f, ".lrc"))
    );

    for (const file of musicFiles) {
      const ext = path.extname(file).toLowerCase();
      if (!validAudioExts.has(ext)) continue;

      const basename = path.basename(file, ext);
      const filePath = path.join(musicDir, file);
      const audioPath = `/music/${file}`;
      const lrcPath = lrcFiles.has(basename)
        ? `/music/${basename}.lrc`
        : undefined;

      let title = "";
      let artist = "";
      let album = "";
      let duration = 0;
      let coverPath = undefined;

      try {
        const metadata = await parseFile(filePath);
        title = metadata.common?.title?.trim() || "";
        artist = metadata.common?.artist?.trim() || "";
        album = metadata.common?.album?.trim() || "";
        duration = Math.round(metadata.format?.duration || 0);

        const cover = selectCover(metadata.common?.picture);
        if (cover && cover.data) {
          await fs.mkdir(coversDir, { recursive: true });
          const coverExt = cover.format === "image/png" ? ".png" : ".jpg";
          const coverFilename = `${basename}${coverExt}`;
          const coverDiskPath = path.join(coversDir, coverFilename);
          await fs.writeFile(coverDiskPath, cover.data);
          coverPath = `/music/covers/${coverFilename}`;
        }
      } catch {
        // ID3 parse failure or empty file -> fallback to filename
      }

      if (!title || !artist) {
        const fallback = parseFallbackTitleAndArtist(basename);
        if (!title) title = fallback.title;
        if (!artist) artist = fallback.artist;
      }

      musicTracks.push({
        id: basename,
        title,
        artist,
        album: album || "Single",
        duration,
        audioPath,
        ...(lrcPath ? { lrcPath } : {}),
        ...(coverPath ? { coverPath } : {}),
      });
    }
  } catch (err) {
    console.warn("Notice: could not read music directory", err.message);
  }

  // Save manifests
  const wallpapersJson = JSON.stringify(wallpapers, null, 2);
  const musicJson = JSON.stringify(musicTracks, null, 2);

  await fs.writeFile(
    path.join(outDir, "wallpapers.json"),
    wallpapersJson,
    "utf8"
  );
  await fs.writeFile(path.join(outDir, "music.json"), musicJson, "utf8");

  // Also write to public/ if publicDir exists
  try {
    await fs.writeFile(
      path.join(publicDir, "wallpapers.json"),
      wallpapersJson,
      "utf8"
    );
    await fs.writeFile(path.join(publicDir, "music.json"), musicJson, "utf8");
  } catch {
    // Ignore error writing to public
  }

  console.log(
    `✓ Manifests generated: ${wallpapers.length} wallpapers, ${musicTracks.length} music tracks.`
  );
  return { wallpapers, musicTracks };
}

// Direct invocation CLI check
const isMainModule =
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.resolve(
      new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/i, "$1")
    );
if (isMainModule || process.argv[1]?.endsWith("generate-manifests.mjs")) {
  generateManifests().catch((err) => {
    console.error("Failed to generate manifests:", err);
    process.exit(1);
  });
}
