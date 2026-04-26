/**
 * Cloudflare Pages Function: /api/explain
 * Generates AI-powered personality explanations using Workers AI (Llama 3.1 8B)
 *
 * Uses built-in AI binding - no API tokens needed
 */

// Character descriptions with detailed psychological profiles
// IMPORTANT: These MUST match the character definitions in index.html
const CHARACTER_PROFILES = {
  sun: {
    name: "Sun",
    emoji: "☀️",
    title: "The Cheerful Caretaker",
    description: "You're bursting with sunshine and positivity! Like Sun, you're naturally energetic, love making others smile, and have a playful spirit. You're responsible and try your best to maintain order, even when things get chaotic. Your enthusiasm is contagious and you light up every room you enter!"
  },
  moon: {
    name: "Moon",
    emoji: "🌙",
    title: "The Mysterious Guardian",
    description: "Like Moon, you have a calm and mysterious aura. You're thoughtful and serious, with a dry sense of humor. You value your quiet time and are deeply protective of your personal space. You're the one who handles the difficult tasks that others can't — the necessary darkness to balance the light."
  },
  lunar: {
    name: "Lunar",
    emoji: "🌑",
    title: "The Gentle Soul",
    description: "Sweet, innocent, and full of wonder — that's you! Like Lunar, you have a childlike curiosity about the world. You're kind-hearted and sometimes naive, but your purity of spirit is your greatest strength. You see the good in everyone and just want to be loved. You're the heart that brings everyone together."
  },
  eclipse: {
    name: "Eclipse",
    emoji: "🌗",
    title: "The Complex Unity",
    description: "Like Eclipse, you're a perfect balance of opposites. You embody both the bright energy of day and the calm mystery of night. You struggle sometimes with inner conflicts, but this duality makes you uniquely wise. You're searching for harmony between all your different sides and helping others find balance too."
  },
  solarFlare: {
    name: "Solar Flare",
    emoji: "🔥",
    title: "The Fiery Protector",
    description: "Like Solar Flare, you're intense and fiercely protective. When someone threatens your loved ones, your rage is legendary. You have a strong sense of justice and won't back down from a fight. Your loyalty burns bright and you'd face any danger to keep your family safe. Channel that fire wisely and you're unstoppable."
  },
  foxy: {
    name: "Foxy",
    emoji: "🦊",
    title: "The Loyal Pirate",
    description: "Like Foxy, you're a devoted companion through and through! You might be a bit chaotic with your pirate antics, but your heart is pure gold. You're there for your friends when it matters most, and your loyalty is unshakeable. You bring adventure and fun wherever you go — just watch out for the pranks!"
  },
  earth: {
    name: "Earth",
    emoji: "🌍",
    title: "The Nurturing Parent",
    description: "Motherly and caring, you naturally take others under your wing. Like Earth, you're protective, patient, and full of wisdom. You create safe spaces for those around you and your guidance helps others grow. You're the stabilizing force that keeps the family together through any storm."
  },
  puppet: {
    name: "Puppet",
    emoji: "🎭",
    title: "The Mastermind",
    description: "Like Puppet, you're always thinking several moves ahead. You're observant, calculating, and understand how to influence situations without directly intervening. You see the strings that connect everyone and know just when to pull them. Your intelligence is your greatest asset — use it wisely."
  },
  monty: {
    name: "Monty",
    emoji: "🐊",
    title: "The Confident Competitor",
    description: "Like Montgomery Gator, you're confident, athletic, and always ready to prove yourself. You might come across as arrogant sometimes, but beneath that tough exterior is someone who just wants to be recognized for their worth. You're competitive but can show a softer side to those who earn your trust."
  },
  bloodmoon: {
    name: "Bloodmoon",
    emoji: "🩸",
    title: "The Calculating Force",
    description: "Like Bloodmoon, you're strategic, intense, and not to be underestimated. You see patterns others miss and plan several steps ahead. Whether you're using your powers for good or working through complicated redemption, your depth of thinking is undeniable. You're complex, sometimes frightening, but never boring."
  },
  djMusicMan: {
    name: "DJ Music Man",
    emoji: "🎵",
    title: "The Party Enthusiast",
    description: "Like DJ Music Man, you bring music and energy wherever you go! You're enthusiastic, friendly, and love to entertain. Despite your sometimes overwhelming presence, you're a gentle giant who just wants everyone to have a good time. You're the life of the party and the heartbeat of any gathering."
  },
  jackOMoon: {
    name: "Jack-O-Moon",
    emoji: "🎃",
    title: "The Spooky Prankster",
    description: "Like Jack-O-Moon, you're playful with a spooky twist! You love thrills and surprises, especially the fun kind. You might seem creepy at first, but underneath it's all in good fun. You bring Halloween energy year-round and know how to make others smile — even if you scare them a little first!"
  },
  oldMoon: {
    name: "Old Moon",
    emoji: "🌘",
    title: "The Enigmatic Elder",
    description: "Like Old Moon, you carry wisdom from another dimension. You're mysterious, experienced, and see things others miss. You may seem ominous to those who don't know you, but beneath that exterior lies profound understanding. You've seen things — things that changed you forever."
  },
  ruIN: {
    name: "Ruin",
    emoji: "💀",
    title: "The Misunderstood",
    description: "Like Ruin, you've been through a lot and bear the scars. You may seem scary on the outside, but there's complexity beneath. You're searching for redemption and understanding, even if you don't always show it. Your past doesn't define you — you're writing your own story now, one day at a time."
  },
  positiveMoon: {
    name: "Positive Moon",
    emoji: "✨",
    title: "The Eternal Optimist",
    description: "Like Positive Moon, you always try to see the bright side! You're hopeful, encouraging, and believe things will work out. Your optimism inspires others, even when they're feeling down. You're the voice that says 'we can do this' when everyone else is ready to give up."
  },
  negativeMoon: {
    name: "Negative Moon",
    emoji: "➖",
    title: "The Pessimistic Realist",
    description: "Like Negative Moon, you tend to see the darker side of things. You're realistic, sometimes to a fault, and expect the worst so you're never disappointed. Your skepticism protects you from hurt, but sometimes prevents you from joy. Learning to balance your realism with hope is your greatest challenge."
  }
};

/**
 * Pre-built character prompts for cache optimization
 */
function getCachedCharacterPrompt(character) {
  const profile = CHARACTER_PROFILES[character];
  if (!profile) return null;

  return `CHARACTER PROFILE: ${profile.name} (${profile.emoji})
Title: ${profile.title}
Description: ${profile.description}

This is a TSAMS (Sun and Moon System) personality type based on the celestial-themed characters from the beloved universe.

IMPORTANT: When generating explanations, ALWAYS reference the specific title "${profile.title}" and use details from "${profile.description}" - do not invent alternative titles or descriptions.`;
}

/**
 * Generate AI explanation using Workers AI runtime
 */
async function generateExplanation(answers, character, env) {
  const characterProfile = CHARACTER_PROFILES[character];
  if (!characterProfile) {
    throw new Error(`Unknown character: ${character}`);
  }

  const cachedPrompt = getCachedCharacterPrompt(character);

  const userPrompt = `
Based on the following quiz answers, explain why this person matched with ${characterProfile.name} (${characterProfile.title}).

Their answers reflect these personality patterns:
${answers.map((a, i) => `${i + 1}. ${a.selectedOption || a}`).join('\n')}

Provide a warm, insightful explanation (2-3 sentences) that:
1. Validates their personality traits
2. Explains why they match this character
3. Offers a gentle insight about their strengths
4. Uses a friendly, encouraging tone

Keep it concise and conversational.`;

  try {
    // Check if AI binding is available
    if (!env.AI) {
      console.log('AI binding not available, using fallback');
      return generateFallbackExplanation(characterProfile);
    }

    // Use Workers AI runtime directly
    const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: `You are a warm, insightful personality guide for the TSAMS personality test. You provide thoughtful, encouraging explanations that help people understand themselves better.

CRITICAL: You MUST use the EXACT character title and description from the cached profile below. Do NOT use alternative titles or descriptions. Always reference "${characterProfile.title}" exactly as written.

${cachedPrompt}`
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      max_tokens: 300,
      temperature: 0.8
    });

    return response?.response || generateFallbackExplanation(characterProfile);
  } catch (error) {
    console.error('AI generation error:', error);
    return generateFallbackExplanation(characterProfile);
  }
}

/**
 * Fallback explanation when AI is unavailable
 */
function generateFallbackExplanation(profile) {
  const templates = [
    `You truly embody the spirit of ${profile.name}! Your ${profile.title.toLowerCase()} nature shines through your choices, showing the world your ${profile.emoji} energy.`,
    `As ${profile.name}, you bring ${profile.title.toLowerCase()} energy to everything you do. Your unique perspective is a gift to those around you.`,
    `${profile.name} fits you perfectly! Your answers reveal someone who embodies ${profile.title.toLowerCase()} qualities—exactly what makes this character so special.`
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Main export for Cloudflare Pages Functions
 */
export async function onRequest(context) {
  const { request, env } = context;

  // Handle CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(request.url);

    // GET request handler
    if (request.method === 'GET') {
      return new Response(
        JSON.stringify({
          service: 'TSAMS Personality Explanation API',
          version: '1.0.0',
          aiAvailable: !!env.AI,
          characters: Object.keys(CHARACTER_PROFILES)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST request for explanation generation
    if (request.method === 'POST') {
      const body = await request.json();
      const { answers, character } = body;

      // Validation
      if (!character || !CHARACTER_PROFILES[character]) {
        return new Response(
          JSON.stringify({
            error: 'Invalid character',
            validCharacters: Object.keys(CHARACTER_PROFILES)
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      if (!answers || !Array.isArray(answers)) {
        return new Response(
          JSON.stringify({ error: 'Invalid answers array' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Generate explanation
      const explanation = await generateExplanation(answers, character, env);

      return new Response(
        JSON.stringify({
          explanation,
          character: CHARACTER_PROFILES[character],
          aiPowered: !!env.AI
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}
