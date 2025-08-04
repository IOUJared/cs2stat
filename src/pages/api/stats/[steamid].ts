import type { APIRoute } from 'astro';
import { SteamAPI } from '../../../utils/steamApi';

export const GET: APIRoute = async ({ params, request }) => {
  const steamId = params.steamid;
  
  if (!steamId) {
    return new Response(JSON.stringify({ error: 'Steam ID is required' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    // Get API key from environment variables
    const apiKey = import.meta.env.STEAM_API_KEY;
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Steam API key not configured' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const steamAPI = new SteamAPI(apiKey);
    
    // Convert Steam ID to SteamID64 if needed
    let steamId64: string;
    if (steamId.startsWith('STEAM_')) {
      steamId64 = SteamAPI.steamIdToSteamId64(steamId);
    } else {
      steamId64 = steamId;
    }

    // Fetch player summary and CS2 stats in parallel
    const [playerSummary, cs2Stats] = await Promise.all([
      steamAPI.getPlayerSummary(steamId64),
      steamAPI.getCS2Stats(steamId64)
    ]);

    return new Response(JSON.stringify({
      player: playerSummary,
      stats: cs2Stats
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    });

  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to fetch player stats' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};