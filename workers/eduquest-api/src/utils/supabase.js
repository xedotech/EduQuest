// Supabase client for Cloudflare Workers

export class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
      'apikey': key
    };
  }

  async query(table, options = {}) {
    const { select = '*', where, order, limit } = options;
    
    let url = `${this.url}/rest/v1/${table}?select=${select}`;
    
    if (where) {
      Object.entries(where).forEach(([key, value]) => {
        url += `&${key}=eq.${value}`;
      });
    }
    
    if (order) {
      url += `&order=${order}`;
    }
    
    if (limit) {
      url += `&limit=${limit}`;
    }

    const response = await fetch(url, {
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error(`Supabase query failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async insert(table, data) {
    const response = await fetch(`${this.url}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        ...this.headers,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Supabase insert failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async update(table, data, where) {
    let url = `${this.url}/rest/v1/${table}`;
    
    if (where) {
      const conditions = Object.entries(where)
        .map(([key, value]) => `${key}=eq.${value}`)
        .join('&');
      url += `?${conditions}`;
    }

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        ...this.headers,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Supabase update failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async delete(table, where) {
    let url = `${this.url}/rest/v1/${table}`;
    
    if (where) {
      const conditions = Object.entries(where)
        .map(([key, value]) => `${key}=eq.${value}`)
        .join('&');
      url += `?${conditions}`;
    }

    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error(`Supabase delete failed: ${response.statusText}`);
    }

    return true;
  }

  async verifyJWT(token) {
    try {
      const response = await fetch(`${this.url}/auth/v1/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': this.key
        }
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('JWT verification failed:', error);
      return null;
    }
  }
}

export function createSupabaseClient(env) {
  return new SupabaseClient(
    env.SUPABASE_URL || 'https://mfmwfbvpbcrhebctoyib.supabase.co',
    env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mbXdmYnZwYmNyaGViY3RveWliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MDQ4OTAsImV4cCI6MjA2NzA4MDg5MH0.px3RYMQTmbqTwLVATTJVAZ0SAbYV_PlbDM3igIs-DYs'
  );
}

