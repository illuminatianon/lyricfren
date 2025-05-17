/**
 * API service for making requests to the backend
 */
class ApiService {
  constructor() {
    this.baseUrl = 'http://localhost:3000/api';
  }

  /**
   * Get the full URL for an API endpoint
   * @param {string} endpoint - API endpoint
   * @returns {string} Full URL
   */
  getUrl(endpoint) {
    return `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  }

  /**
   * Make a GET request
   * @param {string} endpoint - API endpoint
   * @returns {Promise<any>} Response data
   */
  async get(endpoint) {
    const response = await fetch(this.getUrl(endpoint));

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `Failed to fetch ${endpoint}`);
    }

    return response.json();
  }

  /**
   * Make a POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @returns {Promise<any>} Response data
   */
  async post(endpoint, data) {
    const response = await fetch(this.getUrl(endpoint), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `Failed to post to ${endpoint}`);
    }

    return response.json();
  }

  /**
   * Make a PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @returns {Promise<any>} Response data
   */
  async put(endpoint, data) {
    const response = await fetch(this.getUrl(endpoint), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `Failed to update ${endpoint}`);
    }

    return response.json();
  }

  /**
   * Make a DELETE request
   * @param {string} endpoint - API endpoint
   * @returns {Promise<any>} Response data
   */
  async delete(endpoint) {
    const response = await fetch(this.getUrl(endpoint), {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `Failed to delete ${endpoint}`);
    }

    return response.json();
  }
}

// Create a singleton instance
const api = new ApiService();

export default api;