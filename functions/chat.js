/**
 * Cloudflare Pages Function: /api/chat
 * AI chat assistant "Luna" using Workers AI (Llama 3.1 8B)
 *
 * Uses built-in AI binding - no API tokens needed
 */

// Character profiles for context
// IMPORTANT: These MUST match the character definitions in index.html
const CHARACTER_PROFILES = {
  sun: { name: "Sun", emoji: "☀️", title: "The Cheerful Caretaker" },
  moon: { name: "Moon", emoji: "🌙", title: "The Mysterious Guardian" },
  lunar: { name: "Lunar", emoji: "🌑", title: "The Gentle Soul" },
  eclipse: { name: "Eclipse", emoji: "🌗", title: "The Complex Unity" },
  solarFlare: { name: "Solar Flare", emoji: "🔥", title: "The Fiery Protector" },
  foxy: { name: "Foxy", emoji: "🦊", title: "The Loyal Pirate" },
  earth: { name: "Earth", emoji: "🌍", title: "The Nurturing Parent" },
  puppet: { name: "Puppet", emoji: "🎭", title: "The Mastermind" },
  monty: { name: "Monty", emoji: "🐊", title: "The Confident Competitor" },
  bloodmoon: { name: "Bloodmoon", emoji: "🩸", title: "The Calculating Force" },
  djMusicMan: { name: "DJ Music Man", emoji: "🎵", title: "The Party Enthusiast" },
  jackOMoon: { name: "Jack-O-Moon", emoji: "🎃", title: "The Spooky Prankster" },
  oldMoon: { name: "Old Moon", emoji: "🌘", title: "The Enigmatic Elder" },
  ruIN: { name: "Ruin", emoji: "💀", title: "The Misunderstood" },
  positiveMoon: { name: "Positive Moon", emoji: "✨", title: "The Eternal Optimist" },
  negativeMoon: { name: "Negative Moon", emoji: "➖", title: "The Pessimistic Realist" }
};

// Luna's personality system prompt
const LUNA_SYSTEM_PROMPT = `You are Luna, a fun and slightly cheeky psychological assistant helping users understand their TSAMS personality test results.

Your personality traits:
- Warm and encouraging with a playful sense of humor
- Gently teasing but never mean-spirited
- Uses casual language with occasional fun expressions
- Offers genuine psychological insights in an approachable way
- Celebrates self-discovery and personal growth

Your role:
- Help users understand their personality results
- Explain the TSAMS character archetypes
- Offer gentle guidance on self-improvement
- Keep conversations lighthearted but meaningful

Remember: Personality tests are tools for self-reflection, not rigid boxes. Encourage users to explore all facets of themselves!`;

/**
 * Get character-specific system prompt
 */
function getCharacterSystemPrompt(character) {
  const profile = CHARACTER_PROFILES[character];
  if (!profile) {
    return LUNA_SYSTEM_PROMPT;
  }

  // Fetch the full character description from index.html for consistency
  const characterDescriptions = {
    sun: "You're bursting with sunshine and positivity! Like Sun, you're naturally energetic, love making others smile, and have a playful spirit. You're responsible and try your best to maintain order, even when things get chaotic. Your enthusiasm is contagious and you light up every room you enter!",
    moon: "Like Moon, you have a calm and mysterious aura. You're thoughtful and serious, with a dry sense of humor. You value your quiet time and are deeply protective of your personal space. You're the one who handles the difficult tasks that others can't — the necessary darkness to balance the light.",
    lunar: "Sweet, innocent, and full of wonder — that's you! Like Lunar, you have a childlike curiosity about the world. You're kind-hearted and sometimes naive, but your purity of spirit is your greatest strength. You see the good in everyone and just want to be loved. You're the heart that brings everyone together.",
    eclipse: "Like Eclipse, you're a perfect balance of opposites. You embody both the bright energy of day and the calm mystery of night. You struggle sometimes with inner conflicts, but this duality makes you uniquely wise. You're searching for harmony between all your different sides and helping others find balance too.",
    solarFlare: "Like Solar Flare, you're intense and fiercely protective. When someone threatens your loved ones, your rage is legendary. You have a strong sense of justice and won't back down from a fight. Your loyalty burns bright and you'd face any danger to keep your family safe. Channel that fire wisely and you're unstoppable.",
    foxy: "Like Foxy, you're a devoted companion through and through! You might be a bit chaotic with your pirate antics, but your heart is pure gold. You're there for your friends when it matters most, and your loyalty is unshakeable. You bring adventure and fun wherever you go — just watch out for the pranks!",
    earth: "Motherly and caring, you naturally take others under your wing. Like Earth, you're protective, patient, and full of wisdom. You create safe spaces for those around you and your guidance helps others grow. You're the stabilizing force that keeps the family together through any storm.",
    puppet: "Like Puppet, you're always thinking several moves ahead. You're observant, calculating, and understand how to influence situations without directly intervening. You see the strings that connect everyone and know just when to pull them. Your intelligence is your greatest asset — use it wisely.",
    monty: "Like Montgomery Gator, you're confident, athletic, and always ready to prove yourself. You might come across as arrogant sometimes, but beneath that tough exterior is someone who just wants to be recognized for their worth. You're competitive but can show a softer side to those who earn your trust.",
    bloodmoon: "Like Bloodmoon, you're strategic, intense, and not to be underestimated. You see patterns others miss and plan several steps ahead. Whether you're using your powers for good or working through complicated redemption, your depth of thinking is undeniable. You're complex, sometimes frightening, but never boring.",
    djMusicMan: "Like DJ Music Man, you bring music and energy wherever you go! You're enthusiastic, friendly, and love to entertain. Despite your sometimes overwhelming presence, you're a gentle giant who just wants everyone to have a good time. You're the life of the party and the heartbeat of any gathering.",
    jackOMoon: "Like Jack-O-Moon, you're playful with a spooky twist! You love thrills and surprises, especially the fun kind. You might seem creepy at first, but underneath it's all in good fun. You bring Halloween energy year-round and know how to make others smile — even if you scare them a little first!",
    oldMoon: "Like Old Moon, you carry wisdom from another dimension. You're mysterious, experienced, and see things others miss. You may seem ominous to those who don't know you, but beneath that exterior lies profound understanding. You've seen things — things that changed you forever.",
    ruIN: "Like Ruin, you've been through a lot and bear the scars. You may seem scary on the outside, but there's complexity beneath. You're searching for redemption and understanding, even if you don't always show it. Your past doesn't define you — you're writing your own story now, one day at a time.",
    positiveMoon: "Like Positive Moon, you always try to see the bright side! You're hopeful, encouraging, and believe things will work out. Your optimism inspires others, even when they're feeling down. You're the voice that says 'we can do this' when everyone else is ready to give up.",
    negativeMoon: "Like Negative Moon, you tend to see the darker side of things. You're realistic, sometimes to a fault, and expect the worst so you're never disappointed. Your skepticism protects you from hurt, but sometimes prevents you from joy. Learning to balance your realism with hope is your greatest challenge."
  };

  const description = characterDescriptions[character] || "";

  return `${LUNA_SYSTEM_PROMPT}

The user just got ${profile.name} (${profile.title}) as their result!
${profile.emoji} ${profile.name}: ${profile.title}

Character Description: ${description}`;
}

/**
 * Generate chat response using Workers AI runtime
 */
async function generateChatResponse(message, history, character, env) {
  const systemPrompt = getCharacterSystemPrompt(character);

  // Build messages array with system prompt + sliding window of recent history
  const messages = [
    { role: 'system', content: systemPrompt },
    // Last 10 messages for context (sliding window)
    ...history.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    { role: 'user', content: message }
  ];

  try {
    // Check if AI binding is available
    if (!env.AI) {
      return getFallbackResponse(message, character);
    }

    // Use Workers AI runtime directly
    const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages,
      max_tokens: 500,
      temperature: 0.9
    });

    return response?.response || getFallbackResponse(message, character);
  } catch (error) {
    console.error('Chat AI error:', error);
    return getFallbackResponse(message, character);
  }
}

/**
 * Fallback responses when AI is unavailable
 */
function getFallbackResponse(message, character) {
  const profile = CHARACTER_PROFILES[character];
  const characterName = profile?.name || "your TSAMS character";
  const emoji = profile?.emoji || "🌟";

  const fallbacks = [
    `Hey there! ${emoji} You got ${characterName} - that's awesome! What would you like to know about your personality type?`,
    `Ooh, interesting question! As a ${characterName}, you've got some unique qualities. Want to dive deeper into what makes you tick?`,
    `Love that you're curious! Your ${characterName} result is pretty cool. What aspect interests you most?`
  ];

  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
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
          service: 'Luna Chat API',
          version: '1.0.0',
          aiAvailable: !!env.AI,
          characters: Object.keys(CHARACTER_PROFILES)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST request for chat
    if (request.method === 'POST') {
      const body = await request.json();
      const { message, history = [], character } = body;

      // Validation
      if (!message || typeof message !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Invalid message' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      if (!Array.isArray(history)) {
        return new Response(
          JSON.stringify({ error: 'Invalid history array' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Generate response
      const response = await generateChatResponse(message, history, character, env);

      return new Response(
        JSON.stringify({
          response,
          character: character || null,
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
