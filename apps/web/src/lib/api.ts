import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setAuthTokens(tokens: { accessToken: string; refreshToken: string }) {
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken;
}

export function clearAccessToken() {
  accessToken = null;
  refreshToken = null;
}

export function getRefreshToken() {
  return refreshToken;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    const data = res.data as { accessToken?: string; refreshToken?: string } | undefined;
    if (data?.accessToken && data?.refreshToken) {
      setAuthTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    } else if (data?.accessToken) {
      accessToken = data.accessToken;
    }
    return res;
  },
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry && refreshToken) {
      error.config._retry = true;
      try {
        const refreshRes = await api.post<{ accessToken: string; refreshToken: string }>(
          '/auth/refresh',
          { refreshToken },
        );
        const data = refreshRes.data;
        if (data?.accessToken && data?.refreshToken) {
          setAuthTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
        }
        return api.request(error.config);
      } catch {
        clearAccessToken();
      }
    }
    return Promise.reject(error);
  },
);
