import { Octokit } from "octokit";

// Initialize Octokit with your token
const octokit = new Octokit({ 
  auth: import.meta.env.VITE_GITHUB_TOKEN 
});

/**
 * Parses "owner/repo" string (e.g. "rolandrao/finance-app")
 */
export const parseRepoString = (repoString) => {
  const parts = repoString.split('/');
  if (parts.length !== 2) return null;
  return { owner: parts[0], repo: parts[1] };
};

/**
 * 1. SYNC: Fetch all open issues from a repo
 */
export const fetchGitHubIssues = async (repoString) => {
  const repo = parseRepoString(repoString);
  if (!repo) return [];

  try {
    const { data } = await octokit.request('GET /repos/{owner}/{repo}/issues', {
      owner: repo.owner,
      repo: repo.repo,
      state: 'open',
      per_page: 100
    });

    // Note: GitHub REST API considers PRs as issues. 
    // Filtering out PRs so we only get actual issues.
    return data
      .filter(issue => !issue.pull_request)
      .map(issue => ({
        title: issue.title,
        body: issue.body,
        github_issue_number: issue.number,
        // Map labels to a clean format
        labels: issue.labels.map(l => ({
          name: l.name,
          color: l.color, // GitHub returns color without '#', e.g., "d73a4a"
          description: l.description
        }))
    }));
  } catch (error) {
    console.error("GitHub Fetch Error:", error);
    return [];
  }
};

/**
 * 1.5 FETCH LABELS: Get all available labels for a repo
 */
export const fetchGitHubLabels = async (repoString) => {
  const repo = parseRepoString(repoString);
  if (!repo) return [];

  try {
    const { data } = await octokit.request('GET /repos/{owner}/{repo}/labels', {
      owner: repo.owner,
      repo: repo.repo,
      per_page: 100
    });

    return data.map(l => ({
      name: l.name,
      color: l.color, // e.g., "d73a4a"
      description: l.description
    }));
  } catch (error) {
    console.error("Failed to fetch labels:", error);
    return [];
  }
};

/**
 * 2. CREATE: Post a new issue to GitHub
 */
export const createGitHubIssue = async (repoString, title, body, labels = []) => { // <--- Added labels
  const repo = parseRepoString(repoString);
  if (!repo) {
    console.error("Invalid Repo Format:", repoString);
    return null;
  }

  try {
    const { data } = await octokit.request('POST /repos/{owner}/{repo}/issues', {
      owner: repo.owner,
      repo: repo.repo,
      title: title,
      body: body || "",
      labels: labels // <--- Send labels to GitHub
    });

    return data.number; 
  } catch (error) {
    console.error("Failed to create GitHub issue:", error);
    return null; 
  }
};

/**
 * 3. UPDATE: Sync local changes back to a GitHub issue
 */
export const updateGitHubIssue = async (repoString, issueNumber, title, body) => {
  const cleanRepo = repoString.replace(/\.git$/, '').replace(/\/$/, '');
  const repo = parseRepoString(cleanRepo);
  
  if (!repo) {
    console.error("DEBUG: GitHub Update Failed - Invalid Repo Format:", repoString);
    throw new Error("Invalid Repo Format");
  }

  console.log(`DEBUG: Sending PATCH to GitHub -> ${cleanRepo} / Issue #${issueNumber}`);
  console.log(`DEBUG: Payload -> Title: "${title}", Body Length: ${body?.length || 0}`);

  try {
    const { data, status } = await octokit.request('PATCH /repos/{owner}/{repo}/issues/{issue_number}', {
      owner: repo.owner,
      repo: repo.repo,
      issue_number: issueNumber,
      title: title,
      body: body,
    });

    console.log(`DEBUG: GitHub API Response Status: ${status}`);
    return data;
  } catch (error) {
    console.error("DEBUG: GitHub API Request Failed:");
    console.error("Status:", error.status);
    console.error("Message:", error.message);
    console.error("Documentation:", error.documentation_url);
    throw error;
  }
};

/**
 * 4. CLOSE: Close an issue on GitHub
 */
export const closeGitHubIssue = async (repoString, issueNumber) => {
  const repo = parseRepoString(repoString);
  if (!repo) return;

  try {
    await octokit.request('PATCH /repos/{owner}/{repo}/issues/{issue_number}', {
      owner: repo.owner,
      repo: repo.repo,
      issue_number: issueNumber,
      state: 'closed'
    });
    return true;
  } catch (error) {
    console.error("Failed to close GitHub issue:", error);
    return false;
  }
};