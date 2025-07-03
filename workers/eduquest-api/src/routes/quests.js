// Quest routes for Cloudflare Workers
import { Router } from 'itty-router';
import { createSupabaseClient } from '../utils/supabase.js';
import { corsHeaders } from '../middleware/cors.js';

const router = Router({ base: '/quests' });

// Get all quests for user
router.get('/', async (request) => {
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

    // Get user's quests
    const quests = await supabase.query('quests', {
      where: { creator_id: user.id },
      order: 'created_at.desc'
    });

    return new Response(JSON.stringify({
      success: true,
      quests
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Quests fetch error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch quests'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Get public quests
router.get('/public', async (request) => {
  try {
    const supabase = createSupabaseClient(request.env);
    
    // Get public quests
    const quests = await supabase.query('quests', {
      where: { is_public: true },
      order: 'created_at.desc',
      limit: 50
    });

    return new Response(JSON.stringify({
      success: true,
      quests
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Public quests fetch error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch public quests'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Get specific quest
router.get('/:id', async (request) => {
  try {
    const { id } = request.params;
    const supabase = createSupabaseClient(request.env);
    
    const quests = await supabase.query('quests', {
      where: { id },
      limit: 1
    });

    const quest = quests[0];

    if (!quest) {
      return new Response(JSON.stringify({
        error: 'Quest not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      quest
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Quest fetch error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch quest'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Create new quest
router.post('/', async (request) => {
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

    const questData = await request.json();
    
    // Create quest
    const newQuest = await supabase.insert('quests', {
      ...questData,
      creator_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    return new Response(JSON.stringify({
      success: true,
      quest: newQuest[0]
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Quest creation error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to create quest'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Update quest
router.put('/:id', async (request) => {
  try {
    const { id } = request.params;
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
    
    // Update quest (only if user is the creator)
    const updatedQuest = await supabase.update('quests', {
      ...updates,
      updated_at: new Date().toISOString()
    }, {
      id,
      creator_id: user.id
    });

    if (!updatedQuest.length) {
      return new Response(JSON.stringify({
        error: 'Quest not found or unauthorized'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      quest: updatedQuest[0]
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Quest update error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to update quest'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Delete quest
router.delete('/:id', async (request) => {
  try {
    const { id } = request.params;
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

    // Delete quest (only if user is the creator)
    await supabase.delete('quests', {
      id,
      creator_id: user.id
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Quest deleted successfully'
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Quest deletion error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to delete quest'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

export const questRoutes = router.handle;

