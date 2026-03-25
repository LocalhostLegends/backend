export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
}
export interface JwtRefreshPayload {
    sub: string;
}
export interface AuthResponse {
    accessToken: string;
}
export interface AuthorizedUser {
    id: string;
    email: string;
    role: string;
}
