import { decodeBase64, djwt } from "../src/src.deps.ts";
import { JWTConfig } from "../src/utils/jwt/JWTConfig.ts";

export function loadJwtConfig(): JWTConfig {
  const jwkEnv = Deno.env.get("SECURE_API_SECRET")!;

  const jwkDecode = new TextDecoder().decode(decodeBase64(jwkEnv));

  const jwk = JSON.parse(jwkDecode || "") as JsonWebKey;

  return {
    Algorithm: { name: "HMAC", hash: "SHA-512" } as AlgorithmIdentifier,
    async Create(data: Record<string, unknown>, expTime?: number) {
      const jwt = await djwt.create(
        { alg: "HS512", typ: "JWT" },
        { exp: djwt.getNumericDate(expTime || this.ExpirationTime), ...data },
        await this.SecretKey(),
      );

      return jwt;
    },
    async Decode<T>(
      token: string,
    ): Promise<[header: unknown, payload: T, signature: Uint8Array]> {
      const [header, payload, signature] = await djwt.decode(token);

      return [header, payload as T, signature];
    },
    ExpirationTime: 60 * 60 * 24 * 365 * 5, // 5 years
    Header: "Authorization",
    JWK: jwk,
    KeyUsages: ["sign", "verify"] as KeyUsage[],
    LoadToken(req: Request) {
      let jwtHeader = req.headers.get(this.Header);

      if (!jwtHeader) {
        const url = new URL(req.url);

        jwtHeader = url.searchParams.get(this.Header) as string;
      }

      const jwtToken = jwtHeader?.replace(`${this.Schema} `, "");

      return jwtToken;
    },
    async SecretKey() {
      return await crypto.subtle.importKey(
        "jwk",
        this.JWK,
        this.Algorithm,
        true,
        this.KeyUsages,
      );
    },
    Schema: "Bearer",
    Type: "JWT",
    async Verify(token: string) {
      const verified = await djwt.verify(token, await this.SecretKey());

      return verified;
    },
  };
}
