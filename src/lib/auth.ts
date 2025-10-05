const AUTH_TOKEN_KEY = "authToken";
const AUTH_TOKEN_TYPE_KEY = "authTokenType";
const AUTH_PROVIDER_KEY = "authProvider";
const AUTH_USER_EMAIL_KEY = "userEmail";
const AUTH_USER_NAME_KEY = "userName";
const AUTH_PLAN_MAX_VIDEOS_KEY = "planMaxVideos";

export const DEFAULT_PLAN_MAX_VIDEOS = 10;

const normaliseTokenType = (value?: string | null): string => {
    if (!value) {
        return "Bearer";
    }
    return value.toLowerCase() === "bearer" ? "Bearer" : value;
};

const normaliseProvider = (value?: string | null): string => {
    if (!value) {
        return "local";
    }
    return value;
};

export interface AuthSession {
    email: string;
    token: string;
    tokenType?: string;
    provider?: string;
    fullName?: string;
}

export interface StoredSession extends AuthSession {
    planMaxVideos: number;
}

export const persistSession = (
    session: AuthSession,
    planMaxVideos: number = DEFAULT_PLAN_MAX_VIDEOS,
): void => {
    const tokenType = normaliseTokenType(session.tokenType);
    const provider = normaliseProvider(session.provider);

    localStorage.setItem(AUTH_TOKEN_KEY, session.token);
    localStorage.setItem(AUTH_TOKEN_TYPE_KEY, tokenType);
    localStorage.setItem(AUTH_PROVIDER_KEY, provider);
    localStorage.setItem(AUTH_USER_EMAIL_KEY, session.email);
    if (session.fullName && session.fullName.trim()) {
        localStorage.setItem(AUTH_USER_NAME_KEY, session.fullName.trim());
    } else {
        localStorage.removeItem(AUTH_USER_NAME_KEY);
    }
    localStorage.setItem(AUTH_PLAN_MAX_VIDEOS_KEY, `${planMaxVideos}`);
};

export const clearSession = (): void => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_TOKEN_TYPE_KEY);
    localStorage.removeItem(AUTH_PROVIDER_KEY);
    localStorage.removeItem(AUTH_USER_EMAIL_KEY);
    localStorage.removeItem(AUTH_USER_NAME_KEY);
    localStorage.removeItem(AUTH_PLAN_MAX_VIDEOS_KEY);
};

export const buildAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
        return {};
    }
    const tokenType = normaliseTokenType(localStorage.getItem(AUTH_TOKEN_TYPE_KEY));
    return { Authorization: `${tokenType} ${token}` };
};

export const readSession = (): StoredSession | null => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const email = localStorage.getItem(AUTH_USER_EMAIL_KEY);
    if (!token || !email) {
        return null;
    }
    const planMaxVideos = Number.parseInt(
        localStorage.getItem(AUTH_PLAN_MAX_VIDEOS_KEY) ?? `${DEFAULT_PLAN_MAX_VIDEOS}`,
        10,
    );
    return {
        email,
        token,
        tokenType: localStorage.getItem(AUTH_TOKEN_TYPE_KEY) ?? undefined,
        provider: localStorage.getItem(AUTH_PROVIDER_KEY) ?? undefined,
        fullName: localStorage.getItem(AUTH_USER_NAME_KEY) ?? undefined,
        planMaxVideos: Number.isFinite(planMaxVideos) ? planMaxVideos : DEFAULT_PLAN_MAX_VIDEOS,
    };
};
