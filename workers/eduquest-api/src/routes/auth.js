// Authentication routes for Cloudflare Workers
import { Router } from 'itty-router';
import { createSupabaseClient } from '../utils/supabase.js';
import { corsHeaders } from '../middleware/cors.js';

const router = Router({ base: '/auth' });

// Verify JWT token
router.post('/verify', async (request) => {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return new Response(JSON.stringify({
        error: 'No token provided'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const supabase = createSupabaseClient(request.env);
    const user = await supabase.verifyJWT(token);

    if (!user) {
      return new Response(JSON.stringify({
        error: 'Invalid token'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      user
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Auth verification error:', error);
    return new Response(JSON.stringify({
      error: 'Authentication failed'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Get user profile
router.get('/profile', async (request) => {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return new Response(JSON.stringify({
        error: 'No authorization header'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createSupabaseClient(request.env);
    const user = await supabase.verifyJWT(token);

    if (!user) {
      return new Response(JSON.stringify({
        error: 'Invalid token'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Get user profile from database
    const profiles = await supabase.query('users', {
      where: { auth_id: user.id },
      limit: 1
    });

    const profile = profiles[0];

    if (!profile) {
      return new Response(JSON.stringify({
        error: 'Profile not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      profile
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch profile'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Update user profile
router.put('/profile', async (request) => {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return new Response(JSON.stringify({
        error: 'No authorization header'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createSupabaseClient(request.env);
    const user = await supabase.verifyJWT(token);

    if (!user) {
      return new Response(JSON.stringify({
        error: 'Invalid token'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const updates = await request.json();
    
    // Update user profile
    const updatedProfile = await supabase.update('users', {
      ...updates,
      last_active: new Date().toISOString()
    }, {
      auth_id: user.id
    });

    return new Response(JSON.stringify({
      success: true,
      profile: updatedProfile[0]
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to update profile'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

export const authRoutes = router.handle;

