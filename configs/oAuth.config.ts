import {
  createAzureADB2COAuth,
  createAzureADOAuth,
  createGitHubOAuth,
} from "../src/oauth/oAuth.ts";

const baseUrl = Deno.env.get("BASE_URL")!;

export const gitHubOAuth = createGitHubOAuth(["admin:org", "user:email"]);

export const azureFathymOAuth = createAzureADB2COAuth(
  ["openid", Deno.env.get("AZURE_ADB2C_CLIENT_ID")!],
  undefined, // `${baseUrl}/signin/callback`,
);

export const azureOAuth = createAzureADOAuth([
  "https://management.core.windows.net//.default",
], `${baseUrl}/signin/callback`);
