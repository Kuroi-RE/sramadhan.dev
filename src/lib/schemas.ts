import { z } from "zod";

export const LocalizedStringSchema = z.object({
  id: z.string().min(1),
  en: z.string().min(1),
});

export type LocalizedString = z.infer<typeof LocalizedStringSchema>;

export const ProfileSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  tagline: LocalizedStringSchema,
  bio: LocalizedStringSchema,
  avatar: z.string().min(1),
  githubUsername: z.string().min(1),
});

export type Profile = z.infer<typeof ProfileSchema>;

export const SocialsSchema = z.object({
  threads: z.string().url().optional().or(z.literal("")),
  instagram: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
});

export type Socials = z.infer<typeof SocialsSchema>;

export const ProjectItemSchema = z.object({
  id: z.string().min(1),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be ISO date string YYYY-MM-DD"),
  thumbnail: z.string().min(1),
  name: LocalizedStringSchema,
  description: LocalizedStringSchema,
  githubUrl: z.string().url().optional().or(z.literal("")),
  demoUrl: z.string().url().optional().or(z.literal("")),
});

export type ProjectItem = z.infer<typeof ProjectItemSchema>;

export const ProjectsSchema = z.array(ProjectItemSchema);

export type Projects = z.infer<typeof ProjectsSchema>;

export const SystemSchema = z.object({
  lockPassword: z.string().min(1),
  lockHint: LocalizedStringSchema,
});

export type SystemConfig = z.infer<typeof SystemSchema>;

export const GitHubStatsSchema = z.object({
  profileUrl: z.string().url(),
  followers: z.number().nonnegative(),
  publicRepos: z.number().nonnegative(),
  totalStars: z.number().nonnegative(),
  topLanguages: z.array(
    z.object({
      language: z.string(),
      count: z.number().nonnegative(),
    })
  ),
});

export type GitHubStats = z.infer<typeof GitHubStatsSchema>;
