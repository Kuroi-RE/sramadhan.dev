import { describe, it, expect } from "vitest";
import { profile } from "../../content/profile";
import { socials } from "../../content/socials";
import { projects } from "../../content/projects";
import { systemConfig } from "../../content/system";
import {
  ProfileSchema,
  SocialsSchema,
  ProjectsSchema,
  SystemSchema,
} from "./schemas";

describe("Content Zod Schemas Validation", () => {
  it("validates profile content correctly", () => {
    const result = ProfileSchema.safeParse(profile);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Satria Ramadhan");
      expect(result.data.tagline.id).toBeTruthy();
      expect(result.data.tagline.en).toBeTruthy();
    }
  });

  it("validates socials content correctly", () => {
    const result = SocialsSchema.safeParse(socials);
    expect(result.success).toBe(true);
  });

  it("validates projects content correctly", () => {
    const result = ProjectsSchema.safeParse(projects);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("validates system config content correctly", () => {
    const result = SystemSchema.safeParse(systemConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.lockPassword).toBe("portfolio");
    }
  });
});
