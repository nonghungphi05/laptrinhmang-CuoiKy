export class HttpClient {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  async request(path, options = {}) {
    const headers = options.headers || {};
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers
    });
      if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Request failed');
    }
    return response.json();
  }
