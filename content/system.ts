import { SystemConfig, SystemSchema } from "@/lib/schemas";

export const systemConfig: SystemConfig = SystemSchema.parse({
  lockPassword: "portfolio",
  lockHint: {
    id: "Ketik 'portfolio' untuk masuk ke desktop.",
    en: "Type 'portfolio' to unlock the desktop.",
  },
});
