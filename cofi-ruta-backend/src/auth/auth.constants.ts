export const BCRYPT_ROUNDS = 12;
export const ACCESS_TOKEN_EXPIRES_IN = '15m';
export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function accessTokenSecret(): string {
  return process.env.JWT_ACCESS_SECRET || 'super_secret_jwt_access_key';
}
