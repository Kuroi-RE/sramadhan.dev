import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { generateManifests } from "../scripts/generate-manifests.mjs";

function createId3Frame(frameId: string, text: string): Buffer {
  const textBuf = Buffer.concat([
    Buffer.from([0]),
    Buffer.from(text, "latin1"),
  ]);
  const sizeBuf = Buffer.alloc(4);
  sizeBuf.writeUInt32BE(textBuf.length, 0);
  const flags = Buffer.alloc(2); // 00 00
  return Buffer.concat([
    Buffer.from(frameId, "ascii"),
    sizeBuf,
    flags,
    textBuf,
  ]);
}

function createApicFrame(imageBytes: Buffer): Buffer {
  const mime = Buffer.from("image/jpeg\0", "latin1");
  const pictureType = Buffer.from([0x03]); // Front cover
  const description = Buffer.from("Cover\0", "latin1");
  const content = Buffer.concat([
    Buffer.from([0]),
    mime,
    pictureType,
    description,
    imageBytes,
  ]);
  const sizeBuf = Buffer.alloc(4);
  sizeBuf.writeUInt32BE(content.length, 0);
  const flags = Buffer.alloc(2);
  return Buffer.concat([Buffer.from("APIC", "ascii"), sizeBuf, flags, content]);
}

function createTaggedMp3Buffer(
  title: string,
  artist: string,
  album: string,
  coverData?: Buffer
): Buffer {
  const frames = [
    createId3Frame("TIT2", title),
    createId3Frame("TPE1", artist),
    createId3Frame("TALB", album),
  ];
  if (coverData) {
    frames.push(createApicFrame(coverData));
  }
  const body = Buffer.concat(frames);

  // Syncsafe integer for size (body length)
  let len = body.length;
  const sizeBytes = Buffer.alloc(4);
  sizeBytes[3] = len & 0x7f;
  len >>= 7;
  sizeBytes[2] = len & 0x7f;
  len >>= 7;
  sizeBytes[1] = len & 0x7f;
  len >>= 7;
  sizeBytes[0] = len & 0x7f;

  const header = Buffer.concat([
    Buffer.from("ID3", "ascii"),
    Buffer.from([0x03, 0x00, 0x00]), // v2.3, no flags
    sizeBytes,
  ]);

  // Dummy MPEG-1 Layer 3 audio frames (MPEG sync 0xFFFB)
  const mp3Frame = Buffer.alloc(104, 0);
  mp3Frame[0] = 0xff;
  mp3Frame[1] = 0xfb;
  mp3Frame[2] = 0x90;
  mp3Frame[3] = 0x64;

  return Buffer.concat([header, body, mp3Frame, mp3Frame, mp3Frame]);
}

describe("Asset Manifest Generator", () => {
  let tempDir: string;
  let publicDir: string;
  let outDir: string;

  beforeAll(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "manifest-test-"));
    publicDir = path.join(tempDir, "public");
    outDir = path.join(tempDir, "out");

    const wallpaperDir = path.join(publicDir, "wallpaper");
    const musicDir = path.join(publicDir, "music");

    await fs.mkdir(wallpaperDir, { recursive: true });
    await fs.mkdir(musicDir, { recursive: true });

    // 1. Wallpaper image
    await fs.writeFile(
      path.join(wallpaperDir, "dark-forest.jpg"),
      Buffer.from("fake-jpg-content")
    );

    // 2. Tagged MP3 with embedded cover
    const fakeCover = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46,
    ]);
    const taggedMp3 = createTaggedMp3Buffer(
      "Midnight City",
      "Satria Band",
      "Neon Dreams",
      fakeCover
    );
    await fs.writeFile(path.join(musicDir, "tagged-track.mp3"), taggedMp3);

    // 3. Paired .lrc for tagged track
    await fs.writeFile(
      path.join(musicDir, "tagged-track.lrc"),
      "[00:01.00]Hello world\n[00:05.00]Testing lyrics"
    );

    // 4. Untagged MP3 with fallback filename pattern "Artist - Title.mp3"
    const untaggedMp3 = Buffer.alloc(200, 0);
    untaggedMp3[0] = 0xff;
    untaggedMp3[1] = 0xfb;
    await fs.writeFile(
      path.join(musicDir, "Lofi Producer - Chill Beats.mp3"),
      untaggedMp3
    );

    // 5. Orphan .lrc without matching audio file
    await fs.writeFile(
      path.join(musicDir, "orphan-lyrics.lrc"),
      "[00:01.00]I have no audio"
    );
  });

  afterAll(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("extracts wallpapers, reads metadata, falls back to filename, ignores orphan lrc, and extracts cover", async () => {
    const { wallpapers, musicTracks } = await generateManifests({
      rootDir: tempDir,
      publicDir,
      outDir,
    });

    // 1. Wallpapers
    expect(wallpapers.length).toBe(1);
    expect(wallpapers[0].id).toBe("dark-forest");
    expect(wallpapers[0].label).toBe("Dark Forest");
    expect(wallpapers[0].path).toBe("/wallpaper/dark-forest.jpg");

    // 2. Music tracks
    expect(musicTracks.length).toBe(2);

    // Tagged track
    const tagged = musicTracks.find((t) => t.id === "tagged-track");
    expect(tagged).toBeDefined();
    expect(tagged?.title).toBe("Midnight City");
    expect(tagged?.artist).toBe("Satria Band");
    expect(tagged?.album).toBe("Neon Dreams");
    expect(tagged?.lrcPath).toBe("/music/tagged-track.lrc");
    expect(tagged?.coverPath).toBe("/music/covers/tagged-track.jpg");

    // Untagged track with fallback
    const untagged = musicTracks.find(
      (t) => t.id === "Lofi Producer - Chill Beats"
    );
    expect(untagged).toBeDefined();
    expect(untagged?.title).toBe("Chill Beats");
    expect(untagged?.artist).toBe("Lofi Producer");
    expect(untagged?.lrcPath).toBeUndefined();

    // Orphan LRC should NOT create a music track
    const orphan = musicTracks.find((t) => t.id.includes("orphan"));
    expect(orphan).toBeUndefined();

    // Check extracted cover exists on disk
    const extractedCover = await fs.readFile(
      path.join(publicDir, "music", "covers", "tagged-track.jpg")
    );
    expect(extractedCover.length).toBeGreaterThan(0);
  });
});
