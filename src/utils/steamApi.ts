// Steam API utilities for CS2 stats
export interface SteamPlayer {
  steamid: string;
  personaname: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  profileurl: string;
  personastate: number;
}

export interface CS2Stats {
  kills: number;
  deaths: number;
  kdr: number;
  headshotPercentage: number;
  accuracy: number;
  totalTimePlayed: number;
  totalKills: number;
  totalDeaths: number;
  totalWins: number;
  totalRounds: number;
}

export class SteamAPI {
  private apiKey: string;
  private baseUrl = 'https://api.steampowered.com';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Convert Steam ID formats
  static steamIdToSteamId64(steamId: string): string {
    // Convert STEAM_0:X:Y format to SteamID64
    const parts = steamId.match(/STEAM_([0-1]):([0-1]):(\d+)/);
    if (!parts) throw new Error('Invalid Steam ID format');
    
    const [, , y, z] = parts;
    const steamId64 = BigInt(z) * 2n + BigInt(y) + 76561197960265728n;
    return steamId64.toString();
  }

  async getPlayerSummary(steamId64: string): Promise<SteamPlayer> {
    const url = `${this.baseUrl}/ISteamUser/GetPlayerSummaries/v0002/?key=${this.apiKey}&steamids=${steamId64}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data.response?.players?.length) {
        throw new Error('Player not found');
      }
      
      return data.response.players[0];
    } catch (error) {
      console.error('Error fetching player summary:', error);
      throw error;
    }
  }

  async getCS2Stats(steamId64: string): Promise<CS2Stats> {
    const url = `${this.baseUrl}/ISteamUserStats/GetUserStatsForGame/v0002/?appid=730&key=${this.apiKey}&steamid=${steamId64}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data.playerstats?.stats) {
        throw new Error('No CS2 stats found for this player');
      }
      
      const stats = data.playerstats.stats;
      const getStatValue = (statName: string): number => {
        const stat = stats.find((s: any) => s.name === statName);
        return stat ? stat.value : 0;
      };

      const totalKills = getStatValue('total_kills');
      const totalDeaths = getStatValue('total_deaths');
      const totalShotsHit = getStatValue('total_shots_hit');
      const totalShotsFired = getStatValue('total_shots_fired');
      const totalHeadshots = getStatValue('total_kills_headshot');
      const totalTimePlayed = getStatValue('total_time_played');
      const totalWins = getStatValue('total_wins');
      const totalRounds = getStatValue('total_rounds_played');

      return {
        kills: totalKills,
        deaths: totalDeaths,
        kdr: totalDeaths > 0 ? parseFloat((totalKills / totalDeaths).toFixed(2)) : totalKills,
        headshotPercentage: totalKills > 0 ? parseFloat(((totalHeadshots / totalKills) * 100).toFixed(1)) : 0,
        accuracy: totalShotsFired > 0 ? parseFloat(((totalShotsHit / totalShotsFired) * 100).toFixed(1)) : 0,
        totalTimePlayed: Math.floor(totalTimePlayed / 3600), // Convert to hours
        totalKills,
        totalDeaths,
        totalWins,
        totalRounds
      };
    } catch (error) {
      console.error('Error fetching CS2 stats:', error);
      throw error;
    }
  }
}