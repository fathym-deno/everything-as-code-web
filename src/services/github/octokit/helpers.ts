import { Octokit } from "@octokit";
import { EaCSourceDetails } from "../../../eac/modules/sources/EaCSourceDetails.ts";
import { Branch, NewRepository, Repository } from "./types.ts";
import { sleep } from "../../../utils/sleep.ts";

export async function configureBranchProtection(
  octokit: Octokit,
  owner: string,
  repo: string,
  branch: string,
  defaultBranch: boolean,
  requireReviews: boolean,
  requiredStatusChecks: string[],
  restrictionTeams: string[],
  lockBranch: boolean,
  username: string,
): Promise<void> {
  await octokit.rest.repos.updateBranchProtection({
    owner: owner,
    repo: repo,
    branch: branch,
    enforce_admins: false,
    lock_branch: lockBranch,
    required_status_checks: {
      strict: true,
      contexts: requiredStatusChecks,
      // checks: requiredStatusChecks.map((check) => {
      //   return { context: check };
      // }),
    },
    required_pull_request_reviews: {
      dismiss_stale_reviews: true,
      require_code_owner_reviews: requireReviews,
      required_approving_review_count: requireReviews ? 1 : 0,
    },
    restrictions: owner === username ? null : {
      teams: restrictionTeams,
      users: [],
    },
  });

  await sleep(1000);

  await octokit.rest.repos.update({
    owner: owner,
    repo: repo,
    default_branch: defaultBranch ? branch : undefined,
    delete_branch_on_merge: true,
  });
}

export async function configureRepository(
  octokit: Octokit,
  repo: Repository,
  sourceDetails: EaCSourceDetails,
): Promise<Repository> {
  const masterBranchName = repo.master_branch || "main";

  const integrationBranchName = "integration";

  const masterBranch = await getBranch(
    octokit,
    sourceDetails.Organization!,
    sourceDetails.Repository!,
    masterBranchName,
  );

  const branches = await listBranches(
    octokit,
    sourceDetails.Organization!,
    sourceDetails.Repository!,
  );

  if (!branches.some((br) => br.name === integrationBranchName)) {
    await octokit.rest.git.createRef({
      owner: sourceDetails.Organization!,
      repo: sourceDetails.Repository!,
      ref: `refs/heads/${integrationBranchName}`,
      sha: masterBranch.commit.sha,
    });
  }

  const requiredStatusChecks: string[] = [
    "continuous-integration",
    "code-review",
  ];

  const restrictionTeams: string[] = ["code-owners"];

  await configureBranchProtection(
    octokit,
    sourceDetails.Organization!,
    sourceDetails.Repository!,
    integrationBranchName,
    false,
    true,
    requiredStatusChecks,
    restrictionTeams,
    true,
    sourceDetails.Username!,
  );

  await configureBranchProtection(
    octokit,
    sourceDetails.Organization!,
    sourceDetails.Repository!,
    masterBranchName,
    true,
    false,
    requiredStatusChecks,
    restrictionTeams,
    false,
    sourceDetails.Username!,
  );

  repo = (await tryGetRepository(
    octokit,
    sourceDetails.Organization!,
    sourceDetails.Repository!,
  ))!;

  return repo;
}

export async function getBranch(
  octokit: Octokit,
  owner: string,
  repo: string,
  branchName: string,
): Promise<Branch> {
  const branchResp = await octokit.rest.repos.getBranch({
    owner: owner,
    repo: repo,
    branch: branchName,
  });

  return branchResp.data;
}

export async function getOrCreateRepository(
  octokit: Octokit,
  details: EaCSourceDetails,
): Promise<Repository> {
  let repo = await tryGetRepository(
    octokit,
    details.Organization!,
    details.Repository!,
  );

  if (!repo) {
    const newRepo: NewRepository = {
      name: details.Repository!,
      delete_branch_on_merge: true,
      auto_init: true,
      license_template: "mit",
    } as NewRepository;

    if (details.Organization !== details.Username) {
      newRepo.org = details.Organization!;

      const createResp = await octokit.rest.repos.createInOrg(newRepo);

      repo = createResp.data;
    } else {
      const createResp = await octokit.rest.repos.createForAuthenticatedUser(
        newRepo,
      );

      repo = createResp.data;
    }
  }

  return repo!;
}

export async function listBranches(
  octokit: Octokit,
  owner: string,
  repo: string,
): Promise<Branch[]> {
  const branchesResp = await octokit.rest.repos.listBranches({
    owner: owner,
    repo: repo,
  });

  return branchesResp.data;
}

export async function tryGetRepository(
  octokit: Octokit,
  organization: string,
  repository: string,
): Promise<Repository | undefined> {
  try {
    const repo = await octokit.rest.repos.get({
      owner: organization,
      repo: repository,
    });

    return repo.data as Repository;
  } catch {
    return undefined;
  }
}
