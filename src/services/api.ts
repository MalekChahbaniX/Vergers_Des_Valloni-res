const BASE_URL = 'https://backendvergi.onrender.com';

async function request(path: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.headers) Object.assign(headers, options.headers);
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  try {
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw new Error(data?.error || data?.msg || res.statusText);
    return data;
  } catch (err) {
    throw err;
  }
}

export const authAPI = {
  signin: (body: any) => request('/auth/signin', { method: 'POST', body: JSON.stringify(body) }),
  signup: (body: any) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/user', { method: 'GET' }),
};

export const stockAPI = {
  getAll: () => request('/stock/getAllPaloxAndAllProductAndCOLD_ROOMS', { method: 'GET' }),
  getStockData: () => request('/stock/getStockData', { method: 'GET' }),
  addPalox: (body: any) => request('/stock/AjoutPalox', { method: 'POST', body: JSON.stringify(body) }),
  movePalox: (body: any) => request('/stock/MovePalox', { method: 'POST', body: JSON.stringify(body) }),
  statistics: (query = '') => request(`/stock/statistics${query ? '?' + query : ''}`, { method: 'GET' }),
};

export default { BASE_URL };
