"use client";

import { useEffect, useState } from "react";
import { GitHubStats } from "@/lib/schemas";
import { profile } from "../../../../content/profile";

export function GitHubOutput() {
  const [data, setData] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const username = profile.githubUsername;
  const fallbackProfileUrl = `https://github.com/${username}`;

  useEffect(() => {
    let isMounted = true;
    fetch("/api/github")
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP error ${res.status}`);
        }
        return res.json();
      })
      .then((json: GitHubStats) => {
        if (isMounted) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (isMounted) {
          setErrorMessage(err.message || "Gagal memuat data dari GitHub");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div
        data-testid="github-loading"
        className="py-1 text-xs text-neutral-400 font-mono animate-pulse"
      >
        [•] Mengambil data statistik GitHub untuk @{username}...
      </div>
    );
  }

  const profileUrl = data?.profileUrl || fallbackProfileUrl;

  return (
    <div
      data-testid="github-output"
      className="space-y-2 py-1 text-xs font-mono"
    >
      <div className="flex items-center gap-2">
        <span className="text-neutral-400">Profil GitHub:</span>
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 font-bold underline hover:text-blue-300"
        >
          {profileUrl}
        </a>
      </div>

      {errorMessage && (
        <div data-testid="github-error" className="text-amber-400 py-0.5">
          Perhatian: {errorMessage} (tetap dapat mengunjungi link di atas).
        </div>
      )}

      {data && (
        <div
          data-testid="github-stats"
          className="space-y-1.5 pl-2 border-l-2 border-neutral-800"
        >
          <div className="grid grid-cols-[140px_1fr] gap-x-2 text-neutral-300">
            <span className="text-neutral-400">Pengikut (Followers):</span>
            <span className="font-semibold text-white">{data.followers}</span>

            <span className="text-neutral-400">Repo Publik:</span>
            <span className="font-semibold text-white">{data.publicRepos}</span>

            <span className="text-neutral-400">Total Bintang:</span>
            <span className="font-semibold text-amber-300">
              ★ {data.totalStars}
            </span>
          </div>

          {data.topLanguages.length > 0 && (
            <div className="pt-1">
              <span className="text-neutral-400 block mb-1">
                Bahasa Teratas:
              </span>
              <div className="flex flex-wrap gap-2">
                {data.topLanguages.map((l) => (
                  <span
                    key={l.language}
                    className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-200 text-[11px]"
                  >
                    {l.language}{" "}
                    <span className="text-neutral-500">({l.count} repo)</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
