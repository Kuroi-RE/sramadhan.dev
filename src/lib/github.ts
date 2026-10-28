import { GitHubStats, GitHubStatsSchema } from "./schemas";

export interface GitHubUserResponse {
  html_url?: string;
  followers?: number;
  public_repos?: number;
}

export interface GitHubRepoResponse {
  stargazers_count?: number;
  language?: string | null;
  fork?: boolean;
}

export function calculateGitHubStats(
  user: GitHubUserResponse,
  repos: GitHubRepoResponse[],
  fallbackUsername: string
): GitHubStats {
  const profileUrl = user.html_url || `https://github.com/${fallbackUsername}`;
  const followers = typeof user.followers === "number" ? user.followers : 0;
  const publicRepos =
    typeof user.public_repos === "number" ? user.public_repos : 0;

  let totalStars = 0;
  const langMap: Record<string, number> = {};

  if (Array.isArray(repos)) {
    for (const repo of repos) {
      totalStars += repo.stargazers_count || 0;
      if (repo.language && typeof repo.language === "string") {
        langMap[repo.language] = (langMap[repo.language] || 0) + 1;
      }
    }
  }

  const topLanguages = Object.entries(langMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([language, count]) => ({ language, count }));

  return GitHubStatsSchema.parse({
    profileUrl,
    followers,
    publicRepos,
    totalStars,
    topLanguages,
  });
}
