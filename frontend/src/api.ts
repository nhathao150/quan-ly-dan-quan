

export const fetchWithAuth = async (url: string, getToken: () => Promise<string | null>, options: RequestInit = {}) => {
  const token = await getToken();
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
}
