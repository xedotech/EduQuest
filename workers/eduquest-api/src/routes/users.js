// User routes for Cloudflare Workers
import { Router } from 'itty-router';
import { createSupabaseClient } from '../utils/supabase.js';
import { corsHeaders } from '../middleware/cors.js';

const router = Router({ base: '/users' });

// Get user statistics
router.get('/stats', async (request) => {
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

    // Get user profile
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

    // Get quest statistics
    const userQuests = await supabase.query('quests', {
      where: { creator_id: profile.id }
    });

    const questProgress = await supabase.query('user_progress', {
      where: { user_id: profile.id }
    });

    const completedQuests = questProgress.filter(p => p.completed).length;
    const totalQuests = questProgress.length;
    const averageScore = totalQuests > 0 
      ? questProgress.reduce((sum, p) => sum + p.score, 0) / totalQuests 
      : 0;

    const stats = {
      profile: {
        level: profile.level,
        xp: profile.xp,
        coins: profile.coins,
        department: profile.department
      },
      quests: {
        created: userQuests.length,
        completed: completedQuests,
        total_attempted: totalQuests,
        average_score: Math.round(averageScore)
      },
      achievements: {
        // Add achievement logic here
        badges: [],
        milestones: []
      }
    };

    return new Response(JSON.stringify({
      success: true,
      stats
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('User stats error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch user statistics'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Add XP and coins to user
router.post('/rewards', async (request) => {
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

    const { xp = 0, coins = 0, reason = 'Quest completion' } = await request.json();

    // Get current user profile
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

    const newXp = profile.xp + xp;
    const newCoins = profile.coins + coins;
    const newLevel = Math.floor(newXp / 100) + 1; // Level up every 100 XP
    const leveledUp = newLevel > profile.level;

    // Update user profile
    const updatedProfile = await supabase.update('users', {
      xp: newXp,
      coins: newCoins,
      level: Math.max(profile.level, newLevel),
      last_active: new Date().toISOString()
    }, {
      auth_id: user.id
    });

    return new Response(JSON.stringify({
      success: true,
      rewards: {
        xp_gained: xp,
        coins_gained: coins,
        leveled_up: leveledUp,
        new_level: newLevel,
        reason
      },
      profile: updatedProfile[0]
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Rewards error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to add rewards'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Get leaderboard
router.get('/leaderboard', async (request) => {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'global';
    const department = url.searchParams.get('department');
    
    const supabase = createSupabaseClient(request.env);
    
    let whereClause = {};
    if (type === 'department' && department) {
      whereClause.department = department;
    }

    // Get top users by XP
    const users = await supabase.query('users', {
      select: 'id,display_name,avatar_url,level,xp,coins,department',
      order: 'xp.desc',
      limit: 50
    });

    // Add rank to each user
    const leaderboard = users.map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    return new Response(JSON.stringify({
      success: true,
      leaderboard,
      type,
      department
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Leaderboard error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch leaderboard'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

export const userRoutes = router.handle;

