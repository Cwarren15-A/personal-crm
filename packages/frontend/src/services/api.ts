
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

  // Auth methods
  async login(credentials: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Contact methods
  async getContacts() {
    return this.request('/contacts');
  }

  async getContact(id: string) {
    return this.request(`/contacts/${id}`);
  }

  async createContact(contact: any) {
    return this.request('/contacts', {
      method: 'POST',
      body: JSON.stringify(contact),
    });
  }

  async updateContact(id: string, contact: any) {
    return this.request(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contact),
    });
  }

  async deleteContact(id: string) {
    return this.request(`/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  // Task methods
  async getTasks() {
    return this.request('/tasks');
  }

  async getTask(id: string) {
    return this.request(`/tasks/${id}`);
  }

  async createTask(task: any) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(id: string, task: any) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  }

  async deleteTask(id: string) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Interaction methods
  async getInteractions() {
    return this.request('/interactions');
  }

  async getInteraction(id: string) {
    return this.request(`/interactions/${id}`);
  }

  async createInteraction(interaction: any) {
    return this.request('/interactions', {
      method: 'POST',
      body: JSON.stringify(interaction),
    });
  }

  async updateInteraction(id: string, interaction: any) {
    return this.request(`/interactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(interaction),
    });
  }

  async deleteInteraction(id: string) {
    return this.request(`/interactions/${id}`, {
      method: 'DELETE',
    });
  }

  // Note methods
  async getNotes() {
    return this.request('/notes');
  }

  async getNote(id: string) {
    return this.request(`/notes/${id}`);
  }

  async createNote(note: any) {
    return this.request('/notes', {
      method: 'POST',
      body: JSON.stringify(note),
    });
  }

  async updateNote(id: string, note: any) {
    return this.request(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(note),
    });
  }

  async deleteNote(id: string) {
    return this.request(`/notes/${id}`, {
      method: 'DELETE',
    });
  }

  // Tag methods
  async getTags() {
    return this.request('/tags');
  }

  async createTag(tag: any) {
    return this.request('/tags', {
      method: 'POST',
      body: JSON.stringify(tag),
    });
  }

  async deleteTag(id: string) {
    return this.request(`/tags/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService(API_BASE_URL);
 