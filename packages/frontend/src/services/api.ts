const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
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

  // Auth endpoints
  async login(): Promise<any> {
    return this.request('/auth/login', {
      method: 'POST',
    });
  }

  async logout(): Promise<any> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<any> {
    return this.request('/auth/me');
  }

  // Contact endpoints
  async getContacts(): Promise<any> {
    return this.request('/contacts');
  }

  async getContact(id: string): Promise<any> {
    return this.request(`/contacts/${id}`);
  }

  async createContact(contactData: any): Promise<any> {
    return this.request('/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }

  async updateContact(id: string, contactData: any): Promise<any> {
    return this.request(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contactData),
    });
  }

  async deleteContact(id: string): Promise<any> {
    return this.request(`/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  // Task endpoints
  async getTasks(params: any = {}): Promise<any> {
    const query = new URLSearchParams(params).toString();
    return this.request(`/tasks${query ? `?${query}` : ''}`);
  }

  async getTask(id: string): Promise<any> {
    return this.request(`/tasks/${id}`);
  }

  async createTask(taskData: any): Promise<any> {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(id: string, taskData: any): Promise<any> {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(id: string): Promise<any> {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService(API_BASE_URL); 