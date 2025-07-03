// Content processing routes for Cloudflare Workers
import { Router } from 'itty-router';
import { createSupabaseClient } from '../utils/supabase.js';
import { corsHeaders } from '../middleware/cors.js';

const router = Router({ base: '/content' });

// Process uploaded content and generate quest
router.post('/process', async (request) => {
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

    const { content, type, title, category = 'General' } = await request.json();

    if (!content || !type || !title) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: content, type, title'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Generate quest from content
    const quest = await generateQuestFromContent(content, title, category);

    // Save quest to database
    const newQuest = await supabase.insert('quests', {
      title: quest.title,
      description: quest.description,
      creator_id: user.id,
      source_type: type,
      source_content: {
        original_text: content,
        processed_at: new Date().toISOString()
      },
      levels: quest.levels,
      category: quest.category,
      difficulty: quest.difficulty,
      tags: quest.tags,
      is_public: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      stats: {
        completions: 0,
        average_score: 0,
        likes: 0
      }
    });

    return new Response(JSON.stringify({
      success: true,
      quest: newQuest[0],
      message: 'Quest generated successfully!'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Content processing error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to process content'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// OCR processing endpoint (placeholder for future implementation)
router.post('/ocr', async (request) => {
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

    // For now, return a placeholder response
    // In production, this would integrate with Google Cloud Vision API or Tesseract.js
    return new Response(JSON.stringify({
      success: true,
      text: 'OCR processing will be implemented in the next phase',
      confidence: 0.95
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('OCR processing error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to process OCR'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Generate quest from content (AI-powered)
async function generateQuestFromContent(content, title, category) {
  // Simple rule-based quest generation
  // In production, this would use more sophisticated AI/NLP
  
  const words = content.split(/\s+/);
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Determine difficulty based on content length and complexity
  let difficulty = 'beginner';
  if (words.length > 500) difficulty = 'intermediate';
  if (words.length > 1000) difficulty = 'advanced';

  // Extract key concepts (simple keyword extraction)
  const keyWords = extractKeywords(content);
  
  // Generate levels
  const levels = generateLevels(content, sentences, keyWords);

  return {
    title: title,
    description: `A quest generated from your ${category.toLowerCase()} content. Master the concepts through interactive challenges!`,
    category: category,
    difficulty: difficulty,
    tags: keyWords.slice(0, 5), // Top 5 keywords as tags
    levels: levels
  };
}

function extractKeywords(text) {
  // Simple keyword extraction (in production, use proper NLP)
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
  ]);

  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word));

  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
}

function generateLevels(content, sentences, keywords) {
  const levels = [];
  const maxLevels = Math.min(5, Math.max(3, Math.floor(sentences.length / 3)));

  for (let i = 0; i < maxLevels; i++) {
    const levelSentences = sentences.slice(
      Math.floor(i * sentences.length / maxLevels),
      Math.floor((i + 1) * sentences.length / maxLevels)
    );

    const level = {
      id: `level_${i + 1}`,
      title: `Level ${i + 1}: ${keywords[i] || 'Concepts'}`,
      content: levelSentences.join('. ') + '.',
      quizzes: generateQuizzes(levelSentences, keywords),
      challenges: generateChallenges(levelSentences, keywords),
      xp_reward: 20 + (i * 10),
      coin_reward: 5 + (i * 2)
    };

    levels.push(level);
  }

  return levels;
}

function generateQuizzes(sentences, keywords) {
  const quizzes = [];
  
  // Generate 2-3 quizzes per level
  for (let i = 0; i < Math.min(3, sentences.length); i++) {
    const sentence = sentences[i];
    if (!sentence || sentence.trim().length < 10) continue;

    // Simple fill-in-the-blank quiz
    const words = sentence.split(' ');
    if (words.length < 5) continue;

    const blankIndex = Math.floor(words.length / 2);
    const correctAnswer = words[blankIndex];
    const questionText = words.map((word, idx) => 
      idx === blankIndex ? '______' : word
    ).join(' ');

    // Generate wrong options
    const wrongOptions = keywords
      .filter(k => k !== correctAnswer.toLowerCase())
      .slice(0, 3);

    if (wrongOptions.length >= 2) {
      const options = [correctAnswer, ...wrongOptions]
        .sort(() => Math.random() - 0.5);

      quizzes.push({
        question: `Fill in the blank: ${questionText}`,
        options: options,
        correct_answer: options.indexOf(correctAnswer),
        explanation: `The correct answer is "${correctAnswer}" based on the context.`
      });
    }
  }

  return quizzes;
}

function generateChallenges(sentences, keywords) {
  const challenges = [];

  // Generate explanation challenge
  if (sentences.length > 0) {
    challenges.push({
      type: 'text',
      prompt: `Explain the main concept from this section in your own words (minimum 50 words).`,
      solution: `Key concepts should include: ${keywords.slice(0, 3).join(', ')}`
    });
  }

  // Generate keyword matching challenge
  if (keywords.length >= 3) {
    challenges.push({
      type: 'multiple_choice',
      prompt: `Which of these terms is most relevant to the content you just studied?`,
      solution: keywords[0]
    });
  }

  return challenges;
}

export const contentRoutes = router.handle;

