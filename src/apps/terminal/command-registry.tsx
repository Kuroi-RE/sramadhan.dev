import { ReactNode } from "react";
import { profile } from "../../../content/profile";
import { socials } from "../../../content/socials";
import { TranslationKey } from "@/lib/i18n";
import { GitHubOutput } from "./commands/GitHubOutput";

export interface CommandContext {
  clearOutput: () => void;
  locale: "id" | "en";
  t: (key: TranslationKey) => string;
}

export interface CommandDefinition {
  name: string;
  aliases?: string[];
  descriptionKey: string;
  defaultDescription: string;
  run: (args: string[], ctx: CommandContext) => Promise<ReactNode> | ReactNode;
}

export const COMMAND_REGISTRY: Record<string, CommandDefinition> = {};

export function registerCommand(cmd: CommandDefinition) {
  COMMAND_REGISTRY[cmd.name.toLowerCase()] = cmd;
  if (cmd.aliases) {
    for (const alias of cmd.aliases) {
      COMMAND_REGISTRY[alias.toLowerCase()] = cmd;
    }
  }
}

// 1. HELP
registerCommand({
  name: "help",
  aliases: ["?"],
  descriptionKey: "terminal.cmdHelp",
  defaultDescription: "Menampilkan daftar perintah yang tersedia",
  run: () => {
    // Unique commands by name
    const uniqueCommands = Array.from(
      new Map(Object.values(COMMAND_REGISTRY).map((c) => [c.name, c])).values()
    );

    return (
      <div className="space-y-1.5 py-1">
        <p className="text-neutral-400 font-semibold mb-2">
          Daftar Perintah Tersedia:
        </p>
        <div className="grid grid-cols-[140px_1fr] gap-y-1 text-xs">
          {uniqueCommands.map((cmd) => (
            <div key={cmd.name} className="contents">
              <span className="text-blue-400 font-bold">
                {cmd.name}
                {cmd.aliases ? ` (${cmd.aliases.join(", ")})` : ""}
              </span>
              <span className="text-neutral-300">{cmd.defaultDescription}</span>
            </div>
          ))}
        </div>
      </div>
    );
  },
});

// 2. ABOUT
registerCommand({
  name: "about",
  aliases: ["whoami", "bio"],
  descriptionKey: "terminal.cmdAbout",
  defaultDescription: "Informasi profil Satria Ramadhan",
  run: (_args, ctx) => {
    const isEn = ctx.locale === "en";
    return (
      <div className="space-y-2 py-1 text-xs">
        <div className="text-sm font-bold text-white">{profile.name}</div>
        <div className="text-blue-400 font-medium">{profile.role}</div>
        <p className="text-neutral-300 leading-relaxed max-w-lg">
          {isEn ? profile.bio.en : profile.bio.id}
        </p>
        <div className="text-neutral-400">
          Tagline:{" "}
          <span className="italic text-neutral-300">
            &ldquo;{isEn ? profile.tagline.en : profile.tagline.id}&rdquo;
          </span>
        </div>
      </div>
    );
  },
});

// 3. SOSIAL / SOCIAL
registerCommand({
  name: "sosial",
  aliases: ["social", "links"],
  descriptionKey: "terminal.cmdSocial",
  defaultDescription: "Tautan akun media sosial & profesional",
  run: () => {
    return (
      <div className="space-y-1 py-1 text-xs">
        <p className="text-neutral-400 font-semibold mb-1">
          Tautan Media Sosial:
        </p>
        {socials.linkedin && (
          <div>
            <span className="text-blue-400 w-24 inline-block">LinkedIn:</span>
            <a
              href={socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline hover:text-blue-300"
            >
              {socials.linkedin}
            </a>
          </div>
        )}
        {socials.instagram && (
          <div>
            <span className="text-pink-400 w-24 inline-block">Instagram:</span>
            <a
              href={socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline hover:text-pink-300"
            >
              {socials.instagram}
            </a>
          </div>
        )}
        {socials.threads && (
          <div>
            <span className="text-emerald-400 w-24 inline-block">Threads:</span>
            <a
              href={socials.threads}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline hover:text-emerald-300"
            >
              {socials.threads}
            </a>
          </div>
        )}
      </div>
    );
  },
});

// 4. CLEAR
registerCommand({
  name: "clear",
  aliases: ["cls"],
  descriptionKey: "terminal.cmdClear",
  defaultDescription: "Membersihkan riwayat layar terminal",
  run: (_args, ctx) => {
    ctx.clearOutput();
    return null;
  },
});

// 5. GITHUB
registerCommand({
  name: "github",
  aliases: ["gh"],
  descriptionKey: "terminal.cmdGitHub",
  defaultDescription: "Menampilkan statistik profil GitHub",
  run: () => {
    return <GitHubOutput />;
  },
});

export function parseCommandLine(input: string): {
  commandName: string;
  args: string[];
} {
  const trimmed = input.trim();
  if (!trimmed) return { commandName: "", args: [] };
  const parts = trimmed.split(/\s+/);
  return {
    commandName: parts[0].toLowerCase(),
    args: parts.slice(1),
  };
}

export async function executeCommand(
  rawInput: string,
  ctx: CommandContext
): Promise<ReactNode> {
  const { commandName, args } = parseCommandLine(rawInput);
  if (!commandName) return null;

  const cmd = COMMAND_REGISTRY[commandName];
  if (!cmd) {
    return (
      <div className="text-red-400 text-xs py-0.5">
        Perintah &apos;{commandName}&apos; tidak ditemukan. Ketik &apos;
        <span className="text-blue-300 font-bold">help</span>&apos; untuk
        melihat daftar perintah.
      </div>
    );
  }

  return await cmd.run(args, ctx);
}
