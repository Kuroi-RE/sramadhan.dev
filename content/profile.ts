import { Profile, ProfileSchema } from "@/lib/schemas";

export const profile: Profile = ProfileSchema.parse({
  name: "Satria Ramadhan",
  role: "Software Engineer",
  tagline: {
    id: "Membangun pengalaman web interaktif dan sistem modern berkinerja tinggi.",
    en: "Crafting interactive web experiences and high-performance modern systems.",
  },
  bio: {
    id: "Software engineer yang berfokus pada arsitektur web modern, antarmuka pengguna interaktif, dan sistem berbasis Typescript.",
    en: "Software engineer focused on modern web architectures, interactive user interfaces, and TypeScript-based systems.",
  },
  avatar: "/avatar-placeholder.png",
  githubUsername: "sramadhan",
});
