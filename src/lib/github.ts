import { Octokit } from "octokit";

const REPO_OWNER = "posel4";
const REPO_NAME = "posel4.github.io";

interface CommitFileOptions {
  path: string;
  content: string;
  message: string;
  token: string;
  sha?: string;
}

export async function commitFile({
  path,
  content,
  message,
  token,
  sha,
}: CommitFileOptions) {
  const octokit = new Octokit({ auth: token });

  const response = await octokit.rest.repos.createOrUpdateFileContents({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    path,
    message,
    content: Buffer.from(content).toString("base64"),
    sha,
    branch: "main",
  });

  return response.data;
}

export async function getFileSha(
  token: string,
  path: string
): Promise<string | undefined> {
  const octokit = new Octokit({ auth: token });

  try {
    const response = await octokit.rest.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path,
      ref: "main",
    });

    if (!Array.isArray(response.data) && response.data.type === "file") {
      return response.data.sha;
    }
  } catch {
    return undefined;
  }

  return undefined;
}
