/**
 * BISENSE - API Service
 * Handles all REST API communications with the Flask backend.
 */

const API = {
  baseUrl: '',

  /**
   * Health check endpoint
   */
  async checkHealth() {
    try {
      const res = await fetch(`${this.baseUrl}/api/health`);
      return await res.json();
    } catch (err) {
      console.warn('[BISENSE API] Health check failed:', err);
      return { status: 'offline' };
    }
  },

  /**
   * Fetch products in Electrical & Electronic Products domain
   */
  async getProducts() {
    try {
      const res = await fetch(`${this.baseUrl}/api/products`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return await res.json();
    } catch (err) {
      console.error('[BISENSE API] Error fetching products:', err);
      return [];
    }
  },

  /**
   * Fetch supported languages list
   */
  async getLanguages() {
    try {
      const res = await fetch(`${this.baseUrl}/api/languages`);
      if (!res.ok) throw new Error('Failed to fetch languages');
      return await res.json();
    } catch (err) {
      console.error('[BISENSE API] Error fetching languages:', err);
      return [];
    }
  },

  /**
   * Fetch full details for a standard
   */
  async getStandard(standardId) {
    try {
      const res = await fetch(`${this.baseUrl}/api/standards/${encodeURIComponent(standardId)}`);
      if (!res.ok) throw new Error('Standard not found');
      return await res.json();
    } catch (err) {
      console.error(`[BISENSE API] Error fetching standard ${standardId}:`, err);
      return null;
    }
  },

  /**
   * Check query for product typos
   */
  async checkQuery(query) {
    try {
      const res = await fetch(`${this.baseUrl}/api/check_query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ query: query.trim() })
      });
      if (!res.ok) return { has_typo: false, suggestions: [] };
      return await res.json();
    } catch (err) {
      console.warn('[BISENSE API] Query check failed:', err);
      return { has_typo: false, suggestions: [] };
    }
  },

  /**
   * Submit requirement query to recommendation engine
   */
  async recommend(query, language = 'auto', product = 'all') {
    const payload = {
      query: query.trim(),
      language: language,
      product: product
    };

    const res = await fetch(`${this.baseUrl}/api/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with status ${res.status}`);
    }

    return await res.json();
  },

  /**
   * Upload tender or specification document (.pdf, .docx, .txt, etc.)
   */
  async uploadSpecFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${this.baseUrl}/api/upload_spec`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Upload failed with status ${res.status}`);
    }

    return await res.json();
  }
};

window.BISENSE_API = API;
