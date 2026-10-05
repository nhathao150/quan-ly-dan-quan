import { SERVER_URL, API_BASE_URL } from './config';

export const fetchWithAuth = async (url: string, getToken: () => Promise<string | null>, options: RequestInit = {}) => {
  const token = await getToken();
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': \`Bearer \${token}\`
    }
  });
}
