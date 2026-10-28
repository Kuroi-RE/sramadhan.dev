import { NextResponse } from "next/server";
import { profile } from "../../../../content/profile";
import { calculateGitHubStats } from "@/lib/github";

export async function GET() {
  const username = profile.githubUsername;
  const token = process.env.GITHUB_TOKEN;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "sramadhan-cv-app",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, {
        headers,
        next: { revalidate: 3600 },
      }),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100`, {
        headers,
        next: { revalidate: 3600 },
      }),
    ]);

    if (userRes.status === 403 || reposRes.status === 403) {
      return NextResponse.json(
        {
          error: "GitHub API rate limit exceeded. Please try again later.",
          profileUrl: `https://github.com/${username}`,
        },
        { status: 403 }
      );
    }

    if (!userRes.ok || !reposRes.ok) {
      return NextResponse.json(
        {
          error: `Upstream error from GitHub API (Status: ${userRes.status || reposRes.status})`,
          profileUrl: `https://github.com/${username}`,
        },
        { status: 502 }
      );
    }

    const userData = await userRes.json();
    const reposData = await reposRes.json();

    const stats = calculateGitHubStats(userData, reposData, username);
    return NextResponse.json(stats, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Failed to connect to GitHub API",
        message: err instanceof Error ? err.message : String(err),
        profileUrl: `https://github.com/${username}`,
      },
      { status: 500 }
    );
  }
}
