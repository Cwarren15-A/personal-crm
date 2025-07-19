
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

class ApiService {
  private baseURL: string;
  private csrfToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.init();
  }

  private async init() {
    try {
      const { csrfToken } = await this.request<{ csrfToken: string }>('/csrf-token');
      this.csrfToken = csrfToken;
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(this.csrfToken && { 'X-CSRF-Token': this.csrfToken }),
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // ... (the rest of the class remains the same)
}

export const apiService = new ApiService(API_BASE_URL);
 