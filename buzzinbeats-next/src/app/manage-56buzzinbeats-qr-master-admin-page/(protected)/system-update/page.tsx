import { execFileSync } from "node:child_process";
import { requireAdmin } from "@/lib/data/admin";

type Commit = { hash: string; author: string; date: string; message: string };

function getLocalGitInfo(): { commit: string | null; commits: Commit[] } {
  try {
    const commit = execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: process.cwd() }).toString().trim();
    const raw = execFileSync("git", ["log", "-n", "10", "--pretty=format:%h|%an|%ar|%s"], { cwd: process.cwd() }).toString().trim();
    const commits = raw
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [hash, author, date, ...rest] = line.split("|");
        return { hash, author, date, message: rest.join("|") };
      });
    return { commit, commits };
  } catch {
    return { commit: null, commits: [] };
  }
}

export default async function AdminSystemUpdatePage() {
  await requireAdmin();

  const vercelSha = process.env.VERCEL_GIT_COMMIT_SHA;
  const vercelMessage = process.env.VERCEL_GIT_COMMIT_MESSAGE;
  const vercelAuthor = process.env.VERCEL_GIT_COMMIT_AUTHOR_NAME;
  const vercelRef = process.env.VERCEL_GIT_COMMIT_REF;
  const vercelRepo = process.env.VERCEL_GIT_REPO_SLUG && process.env.VERCEL_GIT_REPO_OWNER
    ? `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
    : null;

  const local = getLocalGitInfo();
  const currentCommit = vercelSha ? vercelSha.slice(0, 7) : local.commit;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">System Deployment</h1>
        <p className="text-sm text-slate-500">Current build info. Deploys happen automatically via Vercel on push to the main branch.</p>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="mb-2 text-xs font-bold tracking-widest text-slate-400 uppercase">Current Version</p>
        <p className="font-mono text-2xl font-black text-slate-900">{currentCommit ?? "Unknown"}</p>
        <p className="text-xs text-slate-400">Active Build Hash{vercelRef ? ` · branch ${vercelRef}` : ""}</p>
        {vercelMessage && (
          <p className="mt-3 text-sm text-slate-600">
            &ldquo;{vercelMessage}&rdquo; {vercelAuthor && <span className="text-slate-400">— {vercelAuthor}</span>}
          </p>
        )}
        {vercelRepo && (
          <a href={`https://github.com/${vercelRepo}/commits`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
            <span className="material-symbols-outlined text-base">history</span>
            View full commit history on GitHub
          </a>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="mb-4 text-xs font-bold tracking-widest text-slate-400 uppercase">Recent Commits (local checkout)</p>
        {local.commits.length === 0 ? (
          <p className="text-sm text-slate-400">
            No local commit history available in this environment.
            {vercelRepo ? (
              <>
                {" "}
                See the{" "}
                <a href={`https://github.com/${vercelRepo}/commits`} target="_blank" rel="noreferrer" className="font-bold text-primary hover:underline">
                  GitHub commit history
                </a>{" "}
                instead.
              </>
            ) : (
              " Check the Vercel dashboard for deployment history."
            )}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 text-left text-xs font-bold text-slate-400 uppercase">
              <tr>
                <th className="py-2">Commit</th>
                <th className="py-2">Message</th>
                <th className="py-2">Author</th>
                <th className="py-2">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {local.commits.map((c) => (
                <tr key={c.hash}>
                  <td className="py-2 font-mono text-xs text-slate-500">{c.hash}</td>
                  <td className="py-2 text-slate-800">{c.message}</td>
                  <td className="py-2 text-slate-500">{c.author}</td>
                  <td className="py-2 text-slate-400">{c.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
