export type UserOAuthConnection = {
  ExpiresAt: number;

  RefreshToken: string;

  Token: string;

  Username: string;
};

export function userOAuthConnExpired(
  conn: UserOAuthConnection | null,
): boolean {
  return !conn?.Username || !conn?.Token ||
    new Date() >= new Date(conn.ExpiresAt);
}
