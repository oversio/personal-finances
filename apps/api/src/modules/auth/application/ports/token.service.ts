export const TOKEN_SERVICE = Symbol("TOKEN_SERVICE");

export interface TokenPayload {
  sub: string; // userId
  email: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenService {
  generateAccessToken(payload: TokenPayload): string;
  generateRefreshToken(): string;
  verifyAccessToken(token: string): TokenPayload | null;
  getRefreshTokenExpiration(): Date;
}
