import { Socials, SocialsSchema } from "@/lib/schemas";

export const socials: Socials = SocialsSchema.parse({
  threads: "https://threads.net/@sramadhan",
  instagram: "https://instagram.com/sramadhan",
  linkedin: "https://linkedin.com/in/sramadhan",
});
