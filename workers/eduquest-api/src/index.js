// EduQuest API - Cloudflare Workers
import { corsHeaders } from './middleware/cors.js';

// Simple router implementation
class SimpleRouter {
  constructor() {
    this.routes = [];
  }

  add(method, path, handler) {
    this.routes.push({ method, path, handler });
  }

  get(path, handler) {
    this.add('GET', path, handler);
  }

  post(path, handler) {
    this.add('POST', path, handler);
  }

  put(path, handler) {
    this.add('PUT', path, handler);
  }

  delete(path, handler) {
    this.add('DELETE', path, handler);
  }

  async handle(request) {
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;

    for (const route of this.routes) {
      if (route.method === method && this.matchPath(route.path, path)) {
        const params = this.extractParams(route.path, path);
        request.params = params;
        return await route.handler(request);
      }
    }

    return new Response(JSON.stringify({
      error: 'Not Found',
      message: 'The requested endpoint does not exist'
    }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }

  matchPath(routePath, requestPath) {
    const routeParts = routePath.split('/');
    const requestParts = requestPath.split('/');

    if (routeParts.length !== requestParts.length) {
      return false;
    }

    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        continue; // Parameter, matches anything
      }
      if (routeParts[i] !== requestParts[i]) {
        return false;
      }
    }

    return true;
  }

  extractParams(routePath, requestPath) {
    const routeParts = routePath.split('/');
    const requestParts = requestPath.split('/');
    const params = {};

    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        const paramName = routeParts[i].substring(1);
        params[paramName] = requestParts[i];
      }
    }

    return params;
  }
}

// Create router
const router = new SimpleRouter();

// Health check endpoint
router.get('/health', () => {
  return new Response(JSON.stringify({
    status: 'healthy',
    message: 'EduQuest API is running on Cloudflare Workers',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  }), {
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
});

// Auth routes
router.post('/auth/verify', async (request) => {
  try {
    const body = await request.json();
    return new Response(JSON.stringify({
      success: true,
      message: 'Token verification endpoint (demo mode)',
      received: body
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Invalid JSON'
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
});

// Quests routes
router.get('/quests', async (request) => {
  return new Response(JSON.stringify({
    success: true,
    quests: [],
    message: 'Quests endpoint (demo mode)'
  }), {
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
});

router.post('/quests', async (request) => {
  try {
    const body = await request.json();
    return new Response(JSON.stringify({
      success: true,
      quest: {
        id: 'demo-quest-' + Date.now(),
        ...body,
        created_at: new Date().toISOString()
      },
      message: 'Quest created (demo mode)'
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Invalid JSON'
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
});

// Content processing route
router.post('/content/process', async (request) => {
  try {
    const body = await request.json();
    const { content, title, category = 'General' } = body;

    if (!content || !title) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: content, title'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Simple quest generation
    const quest = {
      id: 'demo-quest-' + Date.now(),
      title: title,
      description: `A quest generated from your ${category.toLowerCase()} content.`,
      category: category,
      difficulty: 'beginner',
      levels: [
        {
          id: 'level_1',
          title: 'Level 1: Introduction',
          content: content.substring(0, 200) + '...',
          quizzes: [
            {
              question: 'What is the main topic of this content?',
              options: [title, 'Other topic', 'Random topic', 'Unknown'],
              correct_answer: 0,
              explanation: 'The main topic is clearly stated in the title.'
            }
          ],
          challenges: [
            {
              type: 'text',
              prompt: 'Summarize the main points in your own words.',
              solution: 'Key concepts from the content'
            }
          ],
          xp_reward: 20,
          coin_reward: 5
        }
      ],
      created_at: new Date().toISOString()
    };

    return new Response(JSON.stringify({
      success: true,
      quest: quest,
      message: 'Quest generated successfully!'
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to process content'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
});

// Main fetch handler
export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    try {
      // Add environment to request for use in routes
      request.env = env;
      
      // Route the request
      return await router.handle(request);
      
    } catch (error) {
      console.error('Worker error:', error);
      
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }
};

