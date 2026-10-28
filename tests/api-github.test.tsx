import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { calculateGitHubStats } from "@/lib/github";
import { GET } from "@/app/api/github/route";
import { GitHubOutput } from "@/apps/terminal/commands/GitHubOutput";

describe("GitHub Stats Calculations", () => {
  it("calculates total stars and top 5 languages correctly", () => {
    const mockUser = {
      html_url: "https://github.com/sramadhan",
      followers: 120,
      public_repos: 15,
    };

    const mockRepos = [
      { stargazers_count: 50, language: "TypeScript" },
      { stargazers_count: 20, language: "TypeScript" },
      { stargazers_count: 10, language: "Rust" },
      { stargazers_count: 5, language: "Go" },
      { stargazers_count: 2, language: "Python" },
      { stargazers_count: 1, language: "JavaScript" },
      { stargazers_count: 0, language: "HTML" },
      { stargazers_count: 0, language: null },
    ];

    const stats = calculateGitHubStats(mockUser, mockRepos, "sramadhan");

    expect(stats.followers).toBe(120);
    expect(stats.publicRepos).toBe(15);
    expect(stats.totalStars).toBe(88);

    // Top 5 languages
    expect(stats.topLanguages.length).toBe(5);
    expect(stats.topLanguages[0]).toEqual({ language: "TypeScript", count: 2 });
  });

  it("handles missing or empty fields safely", () => {
    const stats = calculateGitHubStats({}, [], "sramadhan");
    expect(stats.followers).toBe(0);
    expect(stats.publicRepos).toBe(0);
    expect(stats.totalStars).toBe(0);
    expect(stats.topLanguages).toEqual([]);
    expect(stats.profileUrl).toBe("https://github.com/sramadhan");
  });
});

describe("/api/github Route Handler", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns 200 with normalized stats on successful upstream call", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/repos")) {
        return Promise.resolve(
          new Response(
            JSON.stringify([
              { stargazers_count: 10, language: "TypeScript" },
              { stargazers_count: 5, language: "Rust" },
            ]),
            { status: 200 }
          )
        );
      }
      return Promise.resolve(
        new Response(
          JSON.stringify({
            html_url: "https://github.com/sramadhan",
            followers: 42,
            public_repos: 10,
          }),
          { status: 200 }
        )
      );
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.followers).toBe(42);
    expect(data.totalStars).toBe(15);
    expect(data.topLanguages[0].language).toBe("TypeScript");
  });

  it("returns 403 on rate limit error", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: "API rate limit exceeded" }), {
        status: 403,
      })
    );

    const res = await GET();
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain("rate limit");
  });

  it("returns 500 when fetch throws an error", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network failure"));

    const res = await GET();
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain("Failed to connect");
  });
});

describe("GitHubOutput Component in Terminal", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("renders loading state initially and stats upon resolution", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          profileUrl: "https://github.com/sramadhan",
          followers: 88,
          publicRepos: 12,
          totalStars: 45,
          topLanguages: [{ language: "TypeScript", count: 8 }],
        }),
        { status: 200 }
      )
    );

    render(<GitHubOutput />);
    expect(screen.getByTestId("github-loading")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("github-output")).toBeInTheDocument();
    });

    expect(screen.getByTestId("github-stats")).toBeInTheDocument();
    expect(screen.getByText("88")).toBeInTheDocument();
    expect(screen.getByText("★ 45")).toBeInTheDocument();
  });

  it("displays friendly error message and profile link on fetch failure", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 403,
      })
    );

    render(<GitHubOutput />);

    await waitFor(() => {
      expect(screen.getByTestId("github-error")).toBeInTheDocument();
    });

    expect(screen.getByText(/Rate limit exceeded/)).toBeInTheDocument();
    // Profile URL is still visible
    expect(
      screen.getByText("https://github.com/sramadhan")
    ).toBeInTheDocument();
  });
});
